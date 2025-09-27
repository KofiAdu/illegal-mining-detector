export interface ImageRecord {
  id: number;
  filename: string;
  upload_time: string; 
  location_name: string;
  latitude: number;
  longitude: number;
  prediction: string;
  confidence: number;
  is_illegal_mining: boolean;
}