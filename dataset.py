import os
import cv2
import torch
from torch.utils.data import Dataset

class RGBMiningDataset(Dataset):
    def __init__(self, rgb_dir, transform=None):
        self.rgb_dir = rgb_dir
        self.transform = transform
        self.filenames = []
        self.labels = []
        self.class_map = { 
            'Bareland': 0, 
            'Beach': 1, 
            'Dense-Residential': 2, 
            'Desert': 3, 
            'Farmland': 4, 
            'Forest': 5, 
            'Illegal-Mining': 6, 
            'Legal-Mining': 7, 
            'Mountain': 8, 
            'Sparse-Residential': 9
        }

        '''
        AttributeError: 'tuple' object has no attribute 'to' because the labels were strings 
        self.class_map = {
            'Bareland': 'Bareland', 
            'Beach': 'Beach', 
            'Dense-Residential':'Dense-Residential', 
            'Desert':'Desert', 'Farmland':'Farmland', 
            'Forest':'Forest', 'Illegal-Mining':'Illegal-Mining', 
            'Legal-Mining':'Legal-Mining', 'Mountain':'Mountain', 
            'Sparse-Residential':'Sparse-Residential'
        }
        '''
        for class_name in os.listdir(rgb_dir):
            class_folder = os.path.join(rgb_dir, class_name)
            if not os.path.isdir(class_folder):
                continue
            for fname in os.listdir(class_folder):
                if fname.endswith(('.jpg', '.jpeg', '.png')):
                    full_path = os.path.join(class_folder, fname)
                    self.filenames.append(full_path)
                    self.labels.append(self.class_map[class_name])

    def __len__(self):
        return len(self.filenames)

    def __getitem__(self, idx):
        img_path = self.filenames[idx]
        img = cv2.imread(img_path)
        if img is None:
            raise FileNotFoundError(f"[ERROR] Could not read image: {img_path}")
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (224, 224))

        ##for my CNN model
        #img = torch.tensor(img, dtype=torch.float32).permute(2, 0, 1) / 255.0

        ##for ResNet pretrained model
        img = img / 255.0
        img = torch.tensor(img, dtype=torch.float32).permute(2, 0, 1)  # shape: [3, H, W]

        # Normalize using ImageNet stats for pretrained models like ResNet
        mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
        std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)
        img = (img - mean) / std

        label = self.labels[idx]
        return img, label

