import React, { useState } from "react";
import axios from "axios";
import MapView from "../components/MapView";

const baseUrl = process.env.REACT_APP_BASE_URL;

/*
function parseCoordinate(input: string): number | null {
  const trimmed = input.trim();

  //handle CRS input


  const dmsRegex = /(\d+)[°\s]+(\d+)?['′]?\s*(\d+)?"?\s*([NSEW])/i;

  const match = input.trim().match(dmsRegex);
  if (!match) return null;

  const degrees = parseFloat(match[1]);
  const minutes = parseFloat(match[2] || "0");
  const seconds = parseFloat(match[3] || "0");
  const direction = match[4].toUpperCase();

  let decimal = degrees + minutes / 60 + seconds / 3600;

  if (["S", "W"].includes(direction)) {
    decimal = -decimal;
  }

  return decimal;
}
*/


function parseCoordinate(input: string): number | null {
  const trimmed = input.trim();

  //try plain decimal input (e.g. 4.94799 or -2.30993)
  const decimalMatch = /^-?\d+(\.\d+)?$/.test(trimmed);
  if (decimalMatch) {
    return parseFloat(trimmed);
  }

  //handle optional direction suffix (e.g. 4.94799 N)
  const suffixedDecimal = /^(\d+(\.\d+)?)[°\s]*([NSEW])$/i.exec(trimmed);
  if (suffixedDecimal) {
    let value = parseFloat(suffixedDecimal[1]);
    const direction = suffixedDecimal[3].toUpperCase();
    if (["S", "W"].includes(direction)) {
      value = -value;
    }
    return value;
  }

  //try DMS (degrees, minutes, seconds) format
  const dmsRegex = /(\d+)[°\s]+(\d+)?['′]?\s*(\d+)?"?\s*([NSEW])/i;
  const match = trimmed.match(dmsRegex);
  if (match) {
    const degrees = parseFloat(match[1]);
    const minutes = parseFloat(match[2] || "0");
    const seconds = parseFloat(match[3] || "0");
    const direction = match[4].toUpperCase();

    let decimal = degrees + minutes / 60 + seconds / 3600;
    if (["S", "W"].includes(direction)) {
      decimal = -decimal;
    }

    return decimal;
  }

  return null;
}


function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [locationName, setLocationName] = useState("");
  const [latitudeInput, setLatitudeInput] = useState("");
  const [longitudeInput, setLongitudeInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!file) return;

    const latDecimal = parseCoordinate(latitudeInput);
    const lonDecimal = parseCoordinate(longitudeInput);

    if (latDecimal === null || lonDecimal === null) {
  setError("Invalid coordinate format. Use formats like '60.1699° N' or '5°55′10″N'");
  return;
}

    const formData = new FormData();
    formData.append("file", file);
    formData.append("location_name", locationName);
    formData.append("latitude", latDecimal.toString());
    formData.append("longitude", lonDecimal.toString());

    try {
      setSubmitting(true);
      const res = await axios.post(`${baseUrl}/classify`, formData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError("Upload failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Upload Image</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
        <input
          type="text"
          placeholder="Location name"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          className="w-full border p-2"
          required
        />
        <input
          type="text"
          placeholder='Latitude (e.g. "60.1699° N", "15.1234° S" or in the CRS format)'
          value={latitudeInput}
          onChange={(e) => setLatitudeInput(e.target.value)}
          className="w-full border p-2"
          required
        />
        <input
          type="text"
          placeholder='Longitude (e.g. "24.9384° E", "45.6789° W" or in the CRS format )'
          value={longitudeInput}
          onChange={(e) => setLongitudeInput(e.target.value)}
          className="w-full border p-2"
          required
        />
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {submitting ? "Uploading..." : "Upload"}
        </button>
      </form>

      {result && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold">Prediction Result</h3>
          <p>
            <strong>Class:</strong> {result.prediction}
          </p>
          <p>
            <strong>Confidence:</strong> {result.confidence}
          </p>

          <MapView
            latitude={result.location.lat}
            longitude={result.location.lon}
            markerLabel={result.location.name}
            zoom={12}
            height="300px"
          />
        </div>
      )}
    </div>
  );
}

export default Upload;
