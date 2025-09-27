import torch 
import cv2
#from pathlib import Path
import torch.nn as nn
from torchvision import models


class_map = {
    0: 'Bareland',
    1: 'Beach',
    2: 'Dense-Residential',
    3: 'Desert',
    4: 'Farmland',
    5: 'Forest',
    6: 'Illegal-Mining',
    7: 'Legal-Mining',
    8: 'Mountain',
    9: 'Sparse-Residential'
}


#configure device processing to use gpu if it is available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


##when saving the model I built, I just saved the weight and not weights + architecture
##then I got this error loading the model into my fastapi backend through docker: AttributeError: 'collections.OrderedDict' object has no attribute 'eval'
##so to avoid the error, before the model is loaded, I am recreating same architecture I built the model with
##that way when I load the model, it would load both the architecture and weights.
##Good for docker deployments, portability, and long-term use
class PretrainedResNet(nn.Module):
    def __init__(self, num_classes=10):
        super(PretrainedResNet, self).__init__()
        self.base_model = models.resnet18(pretrained=False)
        in_features = self.base_model.fc.in_features
        self.base_model.fc = nn.Linear(in_features, num_classes)

    def forward(self, x):
        return self.base_model(x)

##set model path
#model_path = Path("app/model/resnet_model.pt")

##load architecture into model
model = PretrainedResNet()

##load model
model.load_state_dict(torch.load("app/model/resnet_model.pt", map_location=device))
model.to(device)
model.eval()


def predict_class(img_path: str):
    img = cv2.imread(img_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (224, 224))
    img = torch.tensor(img, dtype=torch.float32).permute(2, 0, 1) / 255.0

    ##normalize for resnet
    mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1).to(device)
    std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1).to(device)
    img = (img.to(device) - mean) / std

    ##batch dimension
    img = img.unsqueeze(0)

    with torch.no_grad():
        output = model(img)
        probs = torch.nn.functional.softmax(output[0], dim=0)
        pred_idx = torch.argmax(probs).item()
        #pred_label = class_map.get(pred_idx, "Unknown")
        confidence = probs[pred_idx].item()

    return  class_map[pred_idx], round(confidence, 4)