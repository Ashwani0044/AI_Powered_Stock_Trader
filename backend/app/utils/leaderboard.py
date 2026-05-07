import redis
import json

r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
LEADERBOARD_KEY = "trading_leaderboard"

def update_user_profit(user_id, username, profit_change):
    """
    Updates the user's score in the leaderboard.
    storing the 'username' as the member name for easy display.
    """
    # ZINCRBY adds the profit_change to the existing score
    r.zincrby(LEADERBOARD_KEY, profit_change, username)

def get_top_traders(n=10):
    """
    Returns the top N traders with their scores.
    """
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

def get_my_rank(username):
    """
    Finds where the current user stands.
    """
    rank = r.zrevrank(LEADERBOARD_KEY, username)
    score = r.zscore(LEADERBOARD_KEY, username)
    
    return {
        "rank": rank + 1 if rank is not None else "Unranked",
        "profit": float(score) if score else 0
    }