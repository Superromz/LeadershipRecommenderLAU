"""
Decision Support Module
Rule-based mapping from top-3 SHAP features to leadership development domains
and personalised, score-aware development recommendations.

Per the proposal (Section 5.3): each feature maps to a predefined development domain.
The advice is personalised using the student's standardised score to adjust framing.
This mapping is documented for domain-expert and H3 user survey validation.
"""

# ── Feature → Development Domain Mapping ────────────────────────────────────
FEATURE_DOMAIN_MAP = {
    'Role_Assumption':          'Taking Initiative & Ownership',
    'Production_Emphasis':      'Results Orientation & Goal Setting',
    'Initiation_of_Structure':  'Planning & Organising',
    'Tolerance_of_Uncertainty': 'Adaptability & Resilience',
    'Integration':              'Team Cohesion & Collaboration',
    'Consideration':            'Interpersonal Sensitivity & Support',
    # Cultural features (lower expected SHAP — included for completeness)
    'Power_Distance':           'Hierarchy & Authority Navigation',
    'Individualism':            'Independence vs. Collective Thinking',
    'Masculinity':              'Competitive vs. Cooperative Orientation',
    'Uncertainty_Avoidance':    'Risk Management & Structure',
    'Long_Term_Orientation':    'Strategic Thinking & Patience',
    'Indulgence':               'Motivation & Work-Life Balance',
}

# ── Per-Feature Advice Bank (Low / Medium / High standardised score) ─────────
# Score tiers: low < -0.5 std | -0.5 ≤ medium ≤ 0.5 | high > 0.5
ADVICE_BANK = {
    'Role_Assumption': {
        'low': (
            "Your assessment suggests you tend to step back from leadership responsibilities. "
            "A practical starting point is to volunteer to lead one small team activity or project meeting. "
            "Practise stating your perspective first before inviting others, and take ownership of follow-up actions."
        ),
        'medium': (
            "You show a developing tendency to step into leadership roles when the situation calls for it. "
            "Build on this by actively seeking opportunities to lead cross-functional tasks. "
            "Reflect after each experience on what worked and what you would do differently."
        ),
        'high': (
            "You have a strong natural tendency to assume leadership roles. "
            "Channel this by mentoring peers who are less comfortable stepping forward. "
            "Be mindful of leaving space for others to lead so that your team develops collectively."
        ),
    },
    'Production_Emphasis': {
        'low': (
            "Your results show a lower emphasis on task completion and output. "
            "Experiment with structured goal-setting methods such as SMART objectives. "
            "Set weekly milestones for yourself and review them at the end of each week to build this habit."
        ),
        'medium': (
            "You demonstrate a moderate results orientation. "
            "To strengthen this, practise breaking large goals into smaller measurable tasks. "
            "Use a simple tracking system to monitor your output and celebrate small wins."
        ),
        'high': (
            "You have a strong drive for results and task completion. "
            "Make sure to balance your output focus with attention to team wellbeing. "
            "High-performing leaders know when to slow down to invest in people, which improves long-term results."
        ),
    },
    'Initiation_of_Structure': {
        'low': (
            "Your profile suggests you may be more comfortable in fluid, unstructured environments. "
            "For your first management role, practise creating simple frameworks: set clear agendas before meetings, "
            "define roles at the start of each project, and document decisions. Structure builds team confidence."
        ),
        'medium': (
            "You show a developing ability to create clarity and structure for your team. "
            "Build on this by developing templates for recurring tasks such as project kick-offs and status updates. "
            "Ask your team what kinds of structure help them work most effectively."
        ),
        'high': (
            "You have a strong tendency to define roles, procedures, and expectations. "
            "This is a valuable asset in your first management role. "
            "Stay alert to situations that require flexibility — not every challenge needs a new process."
        ),
    },
    'Tolerance_of_Uncertainty': {
        'low': (
            "You may find ambiguous or rapidly changing situations stressful. "
            "Practise reframing uncertainty as an opportunity to learn. "
            "Start small: take on tasks with unclear outcomes and focus on what you can control. "
            "Build a decision-making framework you can apply when information is incomplete."
        ),
        'medium': (
            "You show a moderate level of comfort with ambiguity. "
            "Develop this further by deliberately seeking projects with unclear requirements. "
            "Reflect on how you managed ambiguity and what strategies helped you move forward."
        ),
        'high': (
            "You are comfortable operating in uncertain and changing environments. "
            "This is a strong asset in dynamic organisations. "
            "Use this strength to support team members who find uncertainty more challenging, "
            "and model calm decision-making under pressure."
        ),
    },
    'Integration': {
        'low': (
            "Your profile suggests you may focus more on individual contributions than on unifying the team. "
            "Practise inclusive facilitation: in meetings, actively invite quieter voices and acknowledge "
            "contributions from all team members. Building cohesion is a deliberate, learnable skill."
        ),
        'medium': (
            "You show a developing ability to bring people together around shared goals. "
            "Strengthen this by running structured team reflection sessions and facilitating agreement "
            "on shared norms. Learn the individual strengths of each team member and use them strategically."
        ),
        'high': (
            "You have a strong natural ability to integrate team members and build cohesion. "
            "This is one of the most valued skills in a first-time manager. "
            "Use this to create psychological safety in your team and to resolve conflicts constructively."
        ),
    },
    'Consideration': {
        'low': (
            "Your results indicate a lower emphasis on attending to team members' wellbeing and individual needs. "
            "Practise active listening: in your next one-on-one conversation, spend more time asking questions "
            "than giving answers. Small acts of recognition and support build lasting trust."
        ),
        'medium': (
            "You demonstrate a moderate level of interpersonal sensitivity. "
            "Develop a habit of regular check-ins with team members — not just about work tasks, "
            "but about how they are doing. Understanding individual motivations helps you lead more effectively."
        ),
        'high': (
            "You have a strong orientation toward supporting and considering the needs of others. "
            "This builds deep trust and loyalty in your team. "
            "Balance this by ensuring that your concern for people does not delay difficult decisions "
            "or necessary feedback that the team needs to grow."
        ),
    },
    # Cultural features — shorter, generalist advice
    'Power_Distance': {
        'low': (
            "Your cultural context reflects low power distance — flat hierarchies and participative decision-making. "
            "When leading across cultures, be aware that colleagues from high power distance backgrounds "
            "may expect more directive guidance from their leader."
        ),
        'medium': (
            "Your cultural context shows moderate power distance. "
            "Adapt your communication style based on the cultural expectations of your team members."
        ),
        'high': (
            "Your cultural context reflects high power distance — clear hierarchy and authority are expected. "
            "Be intentional about creating space for your team to speak up and contribute ideas."
        ),
    },
    'Individualism': {
        'low': (
            "Your cultural context values collective harmony over individual achievement. "
            "This orientation supports team cohesion. In individual-oriented workplaces, "
            "ensure personal contributions are also recognised."
        ),
        'medium': (
            "You operate in a context that balances individual and collective values. "
            "Be mindful of how different team members prefer to be recognised — individually or as a group."
        ),
        'high': (
            "Your cultural context values individual achievement and autonomy. "
            "This can drive high personal performance. In team settings, "
            "invest deliberately in building shared identity and collective goals."
        ),
    },
    'Masculinity': {
        'low': (
            "Your cultural context emphasises cooperation, quality of life, and mutual support. "
            "These values translate well to servant and supportive leadership styles."
        ),
        'medium': (
            "Your cultural context balances competitive achievement with cooperative values. "
            "Draw on both to drive results while maintaining team morale."
        ),
        'high': (
            "Your cultural context places high value on achievement, assertiveness, and competition. "
            "Balance this with empathy and support to build a sustainable, high-performing team."
        ),
    },
    'Uncertainty_Avoidance': {
        'low': ("Your context shows comfort with ambiguity and few rules. "
                "Provide clear structures for team members who need more certainty."),
        'medium': ("You operate in a moderately structured environment. "
                   "Match your use of rules and procedures to the needs of each situation."),
        'high': ("Your context values rules, procedures, and predictability. "
                 "Use this to build reliable processes, but stay open to adaptive change."),
    },
    'Long_Term_Orientation': {
        'low': ("Your context values tradition and short-term results. "
                "Complement this by developing a longer-term vision for your team's development."),
        'medium': ("You balance short and long-term thinking. "
                   "Communicate both immediate goals and future direction to your team."),
        'high': ("Your context values persistence, thrift, and long-term planning. "
                 "Use this strength to set sustainable goals and build capabilities over time."),
    },
    'Indulgence': {
        'low': ("Your context emphasises restraint and discipline. "
                "Be intentional about celebrating achievements and supporting work-life balance in your team."),
        'medium': ("You balance restraint with enjoyment. "
                   "Ensure your team has room to enjoy their work and feel energised."),
        'high': ("Your context values enjoyment, freedom, and optimism. "
                 "Channel this energy into a motivating team culture while maintaining focus on goals."),
    },
}


def _score_tier(std_score: float) -> str:
    if std_score < -0.5:
        return 'low'
    elif std_score > 0.5:
        return 'high'
    return 'medium'


def generate_recommendations(top3_shap: list, predicted_class_name: str) -> list:
    """
    Takes the top-3 SHAP features and generates personalised development recommendations.

    Args:
        top3_shap: list of dicts with keys: feature, shap_value, direction, is_behavioural
        predicted_class_name: the student's predicted leadership style

    Returns:
        List of 3 recommendation dicts, each with:
            domain, feature, advice, shap_direction, priority (1/2/3)
    """
    recommendations = []

    for priority, item in enumerate(top3_shap, start=1):
        feature    = item['feature']
        shap_value = item['shap_value']
        std_score  = item.get('feature_value', 0.0)  # standardised value from preprocessor
        tier       = _score_tier(std_score)
        domain     = FEATURE_DOMAIN_MAP.get(feature, 'Leadership Development')
        advice     = ADVICE_BANK.get(feature, {}).get(tier, (
            f"Focus on developing your {domain.lower()} skills to strengthen "
            f"your {predicted_class_name} leadership profile."
        ))

        recommendations.append({
            'priority':        priority,
            'domain':          domain,
            'feature':         feature,
            'score_tier':      tier,
            'shap_direction':  item['direction'],
            'advice':          advice,
        })

    return recommendations
