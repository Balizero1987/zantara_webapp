// Team information handler
import { TEAM_MEMBERS, DEPARTMENTS } from '../../team-config.js';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { query } = JSON.parse(event.body || '{}');

    if (!query) {
      // Return all team members
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          team: Object.values(TEAM_MEMBERS).map(member => ({
            name: member.name,
            role: member.role,
            department: member.department,
            email: member.id + '@balizero.com'
          })),
          departments: DEPARTMENTS,
          total: Object.keys(TEAM_MEMBERS).length
        })
      };
    }

    // Search for specific member
    const results = Object.values(TEAM_MEMBERS).filter(member =>
      member.name.toLowerCase().includes(query.toLowerCase()) ||
      member.role.toLowerCase().includes(query.toLowerCase()) ||
      member.department.toLowerCase().includes(query.toLowerCase())
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ results })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};