import os
from qgis.core import (
    QgsProject, QgsCoordinateReferenceSystem, QgsCoordinateTransform,
    QgsRectangle, QgsPointXY, QgsGeometry, QgsMapSettings,
    QgsMapRendererParallelJob
)
from qgis.PyQt.QtGui import QImage, QPainter
from qgis.PyQt.QtCore import QSize

MINES_LAYER_NAME   = "global_mining_polygons — mining_polygons"     
BASEMAP_LAYER_NAME = "Google Satellite"      
OUTPUT_FOLDER      = r"C:\Users\aduko\OneDrive\Desktop\Mine"   
BUFFER_METERS      = 200                     
IMG_SIZE_PX        = 512                    


os.makedirs(OUTPUT_FOLDER, exist_ok=True)

proj = QgsProject.instance()

mines_layer = proj.mapLayersByName(MINES_LAYER_NAME)[0]
basemap     = proj.mapLayersByName(BASEMAP_LAYER_NAME)[0]

webm = QgsCoordinateReferenceSystem("EPSG:3857")
to_webm = QgsCoordinateTransform(mines_layer.crs(), webm, proj)

def bbox_around_geom_in_3857(geom: QgsGeometry, buf_m: float) -> QgsRectangle:
    g = QgsGeometry(geom)  
    g.transform(to_webm)
    if g.type() == 0:  
        pt = g.asPoint()
        return QgsRectangle(pt.x() - buf_m, pt.y() - buf_m, pt.x() + buf_m, pt.y() + buf_m)
    else: 
        r = g.boundingBox()
        return QgsRectangle(r.xMinimum() - buf_m, r.yMinimum() - buf_m,
                            r.xMaximum() + buf_m, r.yMaximum() + buf_m)

def render_patch(rect_3857: QgsRectangle, out_path: str):
    ms = QgsMapSettings()
    ms.setLayers([basemap])                  
    ms.setDestinationCrs(webm)               
    ms.setExtent(rect_3857)
    ms.setOutputSize(QSize(IMG_SIZE_PX, IMG_SIZE_PX))

    img = QImage(IMG_SIZE_PX, IMG_SIZE_PX, QImage.Format_ARGB32)
    img.fill(0)
    painter = QPainter(img)
    job = QgsMapRendererParallelJob(ms)
    job.start()
    job.waitForFinished()
    job.renderedImage().save(out_path, "PNG")
    painter.end()

for f in mines_layer.getFeatures():
    geom = f.geometry()
    if not geom or geom.isEmpty():
        continue
    rect = bbox_around_geom_in_3857(geom, BUFFER_METERS)
    out = os.path.join(OUTPUT_FOLDER, f"site_{f.id()}_north.png")
    render_patch(rect, out)
    print("Saved:", out)
