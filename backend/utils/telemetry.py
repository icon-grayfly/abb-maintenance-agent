import time
from datetime import datetime
from utils.logger import logger

class AgentTelemetry:
    def __init__(self):
        self.total_queries = 0
        self.fallback_triggers = 0
        self.successful_queries = 0
        self.failed_queries = 0

    def record_query(self, success: bool, used_fallback: bool, duration_ms: float):
        self.total_queries += 1
        if success:
            self.successful_queries += 1
        else:
            self.failed_queries += 1
        
        if used_fallback:
            self.fallback_triggers += 1

        logger.info(
            f"Telemetry Update -> Total: {self.total_queries} | "
            f"Success: {self.successful_queries} | Fallbacks Used: {self.fallback_triggers} | "
            f"Last Duration: {duration_ms:.2f}ms"
        )

    def get_metrics(self):
        return {
            "total_queries": self.total_queries,
            "successful_queries": self.successful_queries,
            "failed_queries": self.failed_queries,
            "fallback_triggers": self.fallback_triggers,
            "success_rate": f"{(self.successful_queries / max(1, self.total_queries)) * 100:.1f}%"
        }

# Global telemetry instance
telemetry = AgentTelemetry()