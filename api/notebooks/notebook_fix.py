"""
Direct patches for Jupyter notebook asyncio issues.
"""
import asyncio
import nest_asyncio

# Apply nest_asyncio to allow nested event loops
nest_asyncio.apply()

def patch_coach(coach):
    """
    Patch a CareerCoachExperiment instance to work in Jupyter notebooks.
    
    Args:
        coach: The coach instance to patch
        
    Returns:
        The patched coach instance
    """
    original_ask_coach = coach.ask_coach
    
    def patched_ask_coach(message, new_thread=False):
        try:
            return asyncio.get_event_loop().run_until_complete(
                coach.get_coach_response(message, new_thread)
            )
        except Exception as e:
            print(f"Error in patched ask_coach: {e}")
            raise
            
    coach.ask_coach = patched_ask_coach
    return coach
