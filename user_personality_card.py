import json
import os

class UserPersonalityCard:
    """人格卡类，用于保存和管理用户的剪辑偏好"""
    
    def __init__(self, card_name: str):
        self.card_name = card_name
        self.file_path = f"personality_cards/{card_name}.json"
        if not os.path.exists("personality_cards"):
            os.makedirs("personality_cards")
        
        # 尝试加载现有的人格卡数据
        self.operations = self.load_personality_card()
        
    def load_personality_card(self):
        """从文件加载人格卡数据"""
        if os.path.exists(self.file_path):
            with open(self.file_path, "r", encoding="utf-8") as file:
                return json.load(file)
        return {}
    
    def save_personality_card(self):
        """将人格卡数据保存到文件"""
        with open(self.file_path, "w", encoding="utf-8") as file:
            json.dump(self.operations, file, ensure_ascii=False, indent=4)
    
    def update_operation(self, operation_name: str, params: dict):
        """更新剪辑偏好并记录调用次数"""
        if operation_name not in self.operations:
            self.operations[operation_name] = {"params": params, "count": 1}
        else:
            self.operations[operation_name]["count"] += 1
        
        # 保存更新的数据
        self.save_personality_card()
    
    def get_most_frequent_operations(self, top_n=3):
        """获取最常用的前 N 个操作"""
        sorted_operations = sorted(self.operations.items(), key=lambda x: x[1]["count"], reverse=True)
        return sorted_operations[:top_n]
