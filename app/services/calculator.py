import json
import os

class CalculatorService:
    def __init__(self, factors_path: str = "data/emission_factors.json"):
        self.factors_path = factors_path
        self.factors = self._load_factors()

    def _load_factors(self):
        if not os.path.exists(self.factors_path):
            return {}
        with open(self.factors_path, "r") as f:
            return json.load(f)

    def calculate_footprint(self, category: str, activity_type: str, value: float) -> float:
        """
        Calculate CO2 footprint based on category, type and value.
        Result is in kg CO2.
        """
        category_factors = self.factors.get(category, {})
        factor = category_factors.get(activity_type, 0)
        return value * factor

calculator_service = CalculatorService()
