import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models

class MultiInputCNN(nn.Module):
    def __init__(self, input_channels=3, num_classes=10):
        super(MultiInputCNN, self).__init__()
        self.conv1 = nn.Conv2d(input_channels, 16, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.dropout = nn.Dropout(0.25)

        self.fc1 = nn.Linear(32 * 56 * 56, 128)
        self.fc2 = nn.Linear(128, num_classes)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = self.dropout(x)
        x = x.view(x.size(0), -1)
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        return x

class PretrainedResNet(nn.Module):
    def __init__(self, num_classes=10):
        super(PretrainedResNet, self).__init__()
        self.base_model = models.resnet18(pretrained=True)
        
        # Replace final fully connected layer
        in_features = self.base_model.fc.in_features
        self.base_model.fc = nn.Linear(in_features, num_classes)

    def forward(self, x):
        return self.base_model(x)