import redis
import json
import os


redis_host = os.environ.get('REDIS_HOST', 'redis')

# Initialize Redis with error handling
try:
    r = redis.Redis(host=redis_host, port=6379, db=0, decode_responses=True)
    r.ping()
    redis_available = True
except Exception as e:
    print(f"Redis not available in leaderboard: {e}")
    r = None
    redis_available = False

LEADERBOARD_KEY = "trading_leaderboard"

def update_user_profit(user_id, username, profit_change):
    """
    Updates the user's score in the leaderboard.
    storing the 'username' as the member name for easy display.
    """
    if not redis_available or r is None:
        return  # Silently fail if Redis is not available
    
    try:
        # ZINCRBY adds the profit_change to the existing score
        r.zincrby(LEADERBOARD_KEY, profit_change, username)
    except Exception as e:
        print(f"Failed to update leaderboard: {e}")

def get_top_traders(n=10):
    """
    Returns the top N traders with their scores.
    """
    if not redis_available or r is None:
        return []  # Return empty list if Redis is not available
    
    try:
        # WITHSCORES returns [('Ash', 500.0), ('User2', 450.0)...]
        raw_data = r.zrevrange(LEADERBOARD_KEY, 0, n-1, withscores=True)
        
        leaderboard = []
        for rank, (name, score) in enumerate(raw_data):
            leaderboard.append({
                "rank": rank + 1,
                "username": name,
                "profit": round(float(score), 2)
            })
        return leaderboard
    except Exception as e:
        print(f"Failed to get top traders: {e}")
        return []

def get_my_rank(username):
    """
    Finds where the current user stands.
    """
    if not redis_available or r is None:
        return {"rank": "Unranked", "profit": 0}  # Return default if Redis unavailable
    
    try:
        rank = r.zrevrank(LEADERBOARD_KEY, username)
        score = r.zscore(LEADERBOARD_KEY, username)
        
        return {
            "rank": rank + 1 if rank is not None else "Unranked",
            "profit": float(score) if score else 0
        }
    except Exception as e:
        print(f"Failed to get user rank: {e}")
        return {"rank": "Unranked", "profit": 0}