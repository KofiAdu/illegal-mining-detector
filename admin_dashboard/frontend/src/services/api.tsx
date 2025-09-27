import axios from "axios";
import { ImageRecord } from "../types";

const baseUrl = process.env.REACT_APP_BASE_URL

const getAllRecords = async (): Promise<ImageRecord[]> => {
  const response = await axios.get(`${baseUrl}/records`);
  return response.data;
};

const getRecordById = async (id: number): Promise<ImageRecord> => {
  const response = await axios.get(`${baseUrl}/records/${id}`);
  return response.data;
}

const uploadImage = async (
  file: File,
  location: string,
  latitude: number,
  longitude: number
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("location", location);
  formData.append("latitude", latitude.toString());
  formData.append("longitude", longitude.toString());

  const response = await axios.post(`${baseUrl}/classify`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};


export {getAllRecords, getRecordById, uploadImage}