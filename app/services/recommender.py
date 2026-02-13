from typing import List
from .. import schemas

class RecommenderService:
    def get_recommendations(self, activities: List[schemas.Activity]) -> List[schemas.Recommendation]:
        recommendations = []
        
        # High level logic based on activity history
        categories_sum = {}
        for activity in activities:
            categories_sum[activity.category] = categories_sum.get(activity.category, 0) + activity.co2_footprint
            
        if not activities:
            return [
                schemas.Recommendation(
                    category="General",
                    tip="Start logging your daily activities to get personalized tips!",
                    impact_level="Medium"
                )
            ]

        # Travel recommendations
        if categories_sum.get("travel", 0) > 50:
            recommendations.append(
                schemas.Recommendation(
                    category="travel",
                    tip="Consider using public transport or carpooling to reduce your travel footprint.",
                    impact_level="High"
                )
            )
        
        # Electricity recommendations
        if categories_sum.get("electricity", 0) > 30:
            recommendations.append(
                schemas.Recommendation(
                    category="electricity",
                    tip="Switch to LED bulbs and unplug devices when not in use.",
                    impact_level="Medium"
                )
            )

        # Food recommendations
        if categories_sum.get("food", 0) > 20:
            recommendations.append(
                schemas.Recommendation(
                    category="food",
                    tip="Try incorporating more plant-based meals into your diet.",
                    impact_level="High"
                )
            )

        # Default recommendation if list is small
        if len(recommendations) < 2:
            recommendations.append(
                schemas.Recommendation(
                    category="General",
                    tip="Walk or cycle for short distances whenever possible.",
                    impact_level="Medium"
                )
            )
            
        return recommendations

recommender_service = RecommenderService()
