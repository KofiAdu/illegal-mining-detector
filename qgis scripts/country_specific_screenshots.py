import os, csv
from qgis.core import (
    QgsProject, QgsCoordinateReferenceSystem, QgsCoordinateTransform,
    QgsRectangle, QgsPointXY, QgsGeometry, QgsMapSettings, QgsMapRendererParallelJob,
    QgsFeatureRequest
)
from qgis.PyQt.QtGui import QImage, QPainter
from qgis.PyQt.QtCore import QSize

#configuration
MINES_LAYER_NAME   = "vector-layer"
BASEMAP_LAYER_NAME = "basemap-layer"
OUTPUT_FOLDER      ="outpu-data-path"
BUFFERS_M          = [10, 50, 100, 200, 250]
IMG_SIZE_PX        = 512

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

proj = QgsProject.instance()
mines_layer = proj.mapLayersByName(MINES_LAYER_NAME)[0]
basemap     = proj.mapLayersByName(BASEMAP_LAYER_NAME)[0]

#map rendering CRS (web mercator) and transform from mines layer to 3857
crs_webm = QgsCoordinateReferenceSystem("EPSG:3857")
to_webm  = QgsCoordinateTransform(mines_layer.crs(), crs_webm, proj)

#for coordinate export (lon/lat in WGS84)
crs_wgs84 = QgsCoordinateReferenceSystem("EPSG:4326")
to_wgs84  = QgsCoordinateTransform(mines_layer.crs(), crs_wgs84, proj)

def bbox_around_geom_in_3857(geom: QgsGeometry, buf_m: float) -> QgsRectangle:
    g = QgsGeometry(geom) 
    g.transform(to_webm)
    if g.type() == 0:
        pt = g.asPoint()
        return QgsRectangle(pt.x() - buf_m, pt.y() - buf_m, pt.x() + buf_m, pt.y() + buf_m)
    r = g.boundingBox()
    return QgsRectangle(r.xMinimum() - buf_m, r.yMinimum() - buf_m,
                        r.xMaximum() + buf_m, r.yMaximum() + buf_m)

def render_patch(rect_3857: QgsRectangle, out_path: str):
    ms = QgsMapSettings()
    ms.setLayers([basemap])                
    ms.setDestinationCrs(crs_webm)
    ms.setExtent(rect_3857)
    ms.setOutputSize(QSize(IMG_SIZE_PX, IMG_SIZE_PX))

    img = QImage(IMG_SIZE_PX, IMG_SIZE_PX, QImage.Format_ARGB32)
    img.fill(0)
    painter = QPainter(img)
    job = QgsMapRendererParallelJob(ms)
    job.start(); job.waitForFinished()
    job.renderedImage().save(out_path, "PNG")
    painter.end()

#only Ghana features
req = QgsFeatureRequest().setFilterExpression("trim(lower(\"country\")) = 'ghana'")

coord_rows = []  #each:[site_id, lon, lat]

for f in mines_layer.getFeatures(req):
    geom = f.geometry()
    if not geom or geom.isEmpty():
        continue

    # Representative point for coordinate export:
    # - point: itself
    # - polygon/line: a safe point on surface (inside polygon when possible)
    if geom.type() == 0:
        rep_pt_geom = geom
    elif geom.type() == 2:  # polygon
        rep_pt_geom = geom.pointOnSurface()
    else:  # line
        rep_pt_geom = geom.centroid()

    # Transform representative point to WGS84 and record lon/lat
    try:
        pt_src = rep_pt_geom.asPoint()
        pt_wgs = to_wgs84.transform(QgsPointXY(pt_src))
        lon, lat = pt_wgs.x(), pt_wgs.y()
        coord_rows.append([f.id(), lon, lat])
    except Exception:
        pass

    for buf_m in BUFFERS_M:
        rect = bbox_around_geom_in_3857(geom, buf_m)
        out = os.path.join(OUTPUT_FOLDER, f"site_{f.id()}_buf{buf_m}m.png")
        render_patch(rect, out)
        print("Saved:", out)

csv_path = os.path.join(OUTPUT_FOLDER, "ghana_sites_lonlat.csv")
with open(csv_path, "w", newline="", encoding="utf-8") as fcsv:
    writer = csv.writer(fcsv)
    writer.writerow(["site_id", "lon", "lat"])
    writer.writerows(coord_rows)

print(f"Wrote coordinates to: {csv_path}")
