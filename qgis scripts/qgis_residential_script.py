import os
from qgis.core import (
    QgsProject, QgsCoordinateReferenceSystem, QgsCoordinateTransform,
    QgsRectangle, QgsGeometry, QgsMapSettings, QgsMapRendererParallelJob,
    QgsWkbTypes
)
from qgis.PyQt.QtCore import QSize

RES_LAYER_NAME     = "your_residential_layer"   
BASEMAP_LAYER_NAME = "Google Satellite"         
OUTPUT_FOLDER      = r"/path/to/output"         
BUFFERS_M          = [50, 100, 200]         
IMG_SIZE_PX        = 512

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

proj = QgsProject.instance()
res_layer = proj.mapLayersByName(RES_LAYER_NAME)[0]
basemap   = proj.mapLayersByName(BASEMAP_LAYER_NAME)[0]

WEBM = QgsCoordinateReferenceSystem("EPSG:3857")
to_webm = QgsCoordinateTransform(res_layer.crs(), WEBM, proj)

def rect_around_centroid_in_3857(geom: QgsGeometry, buf_m: float) -> QgsRectangle:
    if geom.type() == QgsWkbTypes.PolygonGeometry:
        center_src = geom.centroid()
    else:
        center_src = geom

    center_wm = QgsGeometry(center_src)
    center_wm.transform(to_webm)
    pt = center_wm.asPoint()

    return QgsRectangle(pt.x() - buf_m, pt.y() - buf_m,
                        pt.x() + buf_m, pt.y() + buf_m)

def render_patch(rect_3857: QgsRectangle, out_path: str):
    ms = QgsMapSettings()
    ms.setLayers([basemap])          
    ms.setDestinationCrs(WEBM)       
    ms.setExtent(rect_3857)
    ms.setOutputSize(QSize(IMG_SIZE_PX, IMG_SIZE_PX))

    job = QgsMapRendererParallelJob(ms)
    job.start()
    job.waitForFinished()
    img = job.renderedImage()
    img.save(out_path, "PNG")

for f in res_layer.getFeatures():
    g = f.geometry()
    if not g or g.isEmpty():
        continue
    fid = f.id()

    for buf in BUFFERS_M:
        rect = rect_around_centroid_in_3857(g, buf)
        out = os.path.join(OUTPUT_FOLDER, f"res_{fid}_{buf}m.png")
        render_patch(rect, out)
        print("Saved:", out)
