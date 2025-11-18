// GreenBlu.ai Database Service
// IndexedDB + Knowledge Graph storage

import { openDB, type IDBPDatabase } from 'idb';
import type {
  User,
  MoodEntry,
  CircadianEntry,
  PersonalityProfile,
  PersonalityResponse,
  FlowSession,
  Intervention,
  InterventionTemplate,
  KnowledgeGraph,
  GraphNode,
  GraphEdge
} from '../types';

const DB_NAME = 'greenblu-db';
const DB_VERSION = 1;

export interface GreenBluDB {
  users: {
    key: string;
    value: User;
  };
  mood_entries: {
    key: string;
    value: MoodEntry;
    indexes: {
      'by-user-date': [string, number];
      'by-flow': [string, number];
    };
  };
  circadian_data: {
    key: string;
    value: CircadianEntry;
    indexes: {
      'by-user-date': [string, string];
    };
  };
  personality_profiles: {
    key: string;
    value: PersonalityProfile;
  };
  personality_responses: {
    key: string;
    value: PersonalityResponse;
    indexes: {
      'by-user-date': [string, number];
    };
  };
  flow_sessions: {
    key: string;
    value: FlowSession;
    indexes: {
      'by-user-date': [string, number];
    };
  };
  interventions: {
    key: string;
    value: Intervention;
    indexes: {
      'by-user-date': [string, number];
    };
  };
  intervention_templates: {
    key: string;
    value: InterventionTemplate;
  };
  graph_nodes: {
    key: string;
    value: GraphNode;
    indexes: {
      'by-user-type': [string, string];
    };
  };
  graph_edges: {
    key: string;
    value: GraphEdge;
    indexes: {
      'by-source': string;
      'by-target': string;
    };
  };
}

class DatabaseService {
  private db: IDBPDatabase | null = null;

  async init(): Promise<void> {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Users
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'user_id' });
        }

        // Mood entries
        if (!db.objectStoreNames.contains('mood_entries')) {
          const moodStore = db.createObjectStore('mood_entries', {
            keyPath: 'entry_id'
          });
          moodStore.createIndex('by-user-date', ['user_id', 'timestamp']);
          moodStore.createIndex('by-flow', ['user_id', 'flow_probability']);
        }

        // Circadian data
        if (!db.objectStoreNames.contains('circadian_data')) {
          const circadianStore = db.createObjectStore('circadian_data', {
            keyPath: 'entry_id'
          });
          circadianStore.createIndex('by-user-date', ['user_id', 'date']);
        }

        // Personality profiles
        if (!db.objectStoreNames.contains('personality_profiles')) {
          db.createObjectStore('personality_profiles', { keyPath: 'user_id' });
        }

        // Personality responses
        if (!db.objectStoreNames.contains('personality_responses')) {
          const responseStore = db.createObjectStore('personality_responses', {
            keyPath: 'response_id'
          });
          responseStore.createIndex('by-user-date', ['user_id', 'timestamp']);
        }

        // Flow sessions
        if (!db.objectStoreNames.contains('flow_sessions')) {
          const flowStore = db.createObjectStore('flow_sessions', {
            keyPath: 'session_id'
          });
          flowStore.createIndex('by-user-date', ['user_id', 'start_time']);
        }

        // Interventions
        if (!db.objectStoreNames.contains('interventions')) {
          const interventionStore = db.createObjectStore('interventions', {
            keyPath: 'intervention_id'
          });
          interventionStore.createIndex('by-user-date', ['user_id', 'timestamp']);
        }

        // Intervention templates
        if (!db.objectStoreNames.contains('intervention_templates')) {
          db.createObjectStore('intervention_templates', { keyPath: 'template_id' });
        }

        // Knowledge Graph - Nodes
        if (!db.objectStoreNames.contains('graph_nodes')) {
          const nodeStore = db.createObjectStore('graph_nodes', { keyPath: 'id' });
          nodeStore.createIndex('by-user-type', ['properties.user_id', 'type']);
        }

        // Knowledge Graph - Edges
        if (!db.objectStoreNames.contains('graph_edges')) {
          const edgeStore = db.createObjectStore('graph_edges', { keyPath: 'id' });
          edgeStore.createIndex('by-source', 'source');
          edgeStore.createIndex('by-target', 'target');
        }
      }
    });

    console.log('Database initialized');
  }

  private ensureDB(): IDBPDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  // User operations
  async getUser(userId: string): Promise<User | undefined> {
    return await this.ensureDB().get('users', userId);
  }

  async saveUser(user: User): Promise<void> {
    await this.ensureDB().put('users', user);
  }

  // Mood operations
  async addMoodEntry(entry: MoodEntry): Promise<void> {
    const db = this.ensureDB();
    await db.add('mood_entries', entry);

    // Clean up old entries (keep last 90 days)
    await this.cleanupOldMoodEntries(entry.user_id);

    // Update knowledge graph
    await this.updateKnowledgeGraphFromMood(entry);
  }

  async getMoodHistory(userId: string, days: number = 30): Promise<MoodEntry[]> {
    const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;
    const db = this.ensureDB();

    return await db.getAllFromIndex(
      'mood_entries',
      'by-user-date',
      IDBKeyRange.bound([userId, cutoffDate], [userId, Date.now()])
    );
  }

  async getLastMoodEntry(userId: string): Promise<MoodEntry | undefined> {
    const entries = await this.getMoodHistory(userId, 1);
    return entries[entries.length - 1];
  }

  private async cleanupOldMoodEntries(userId: string): Promise<void> {
    const cutoffDate = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const db = this.ensureDB();
    const tx = db.transaction('mood_entries', 'readwrite');
    const index = tx.store.index('by-user-date');

    let cursor = await index.openCursor(
      IDBKeyRange.bound([userId, 0], [userId, cutoffDate])
    );

    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }

    await tx.done;
  }

  // Circadian operations
  async saveCircadianEntry(entry: CircadianEntry): Promise<void> {
    await this.ensureDB().put('circadian_data', entry);
  }

  async getCircadianData(userId: string, days: number = 30): Promise<CircadianEntry[]> {
    const db = this.ensureDB();
    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    return await db.getAllFromIndex(
      'circadian_data',
      'by-user-date',
      IDBKeyRange.bound([userId, startDate], [userId, today])
    );
  }

  // Personality operations
  async getPersonalityProfile(userId: string): Promise<PersonalityProfile | undefined> {
    return await this.ensureDB().get('personality_profiles', userId);
  }

  async savePersonalityProfile(profile: PersonalityProfile): Promise<void> {
    await this.ensureDB().put('personality_profiles', profile);
  }

  async addPersonalityResponse(response: PersonalityResponse): Promise<void> {
    await this.ensureDB().add('personality_responses', response);
  }

  async getPersonalityResponses(
    userId: string,
    limit?: number
  ): Promise<PersonalityResponse[]> {
    const db = this.ensureDB();
    const responses = await db.getAllFromIndex(
      'personality_responses',
      'by-user-date',
      IDBKeyRange.bound([userId, 0], [userId, Date.now()])
    );

    return limit ? responses.slice(-limit) : responses;
  }

  // Flow operations
  async startFlowSession(session: FlowSession): Promise<void> {
    await this.ensureDB().add('flow_sessions', session);
  }

  async updateFlowSession(sessionId: string, updates: Partial<FlowSession>): Promise<void> {
    const db = this.ensureDB();
    const session = await db.get('flow_sessions', sessionId);
    if (session) {
      Object.assign(session, updates);
      await db.put('flow_sessions', session);
    }
  }

  async getFlowSessions(userId: string, days: number = 30): Promise<FlowSession[]> {
    const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;
    const db = this.ensureDB();

    return await db.getAllFromIndex(
      'flow_sessions',
      'by-user-date',
      IDBKeyRange.bound([userId, cutoffDate], [userId, Date.now()])
    );
  }

  // Intervention operations
  async addIntervention(intervention: Intervention): Promise<void> {
    await this.ensureDB().add('interventions', intervention);
  }

  async updateIntervention(
    interventionId: string,
    updates: Partial<Intervention>
  ): Promise<void> {
    const db = this.ensureDB();
    const intervention = await db.get('interventions', interventionId);
    if (intervention) {
      Object.assign(intervention, updates);
      await db.put('interventions', intervention);
    }
  }

  async getInterventions(userId: string, days: number = 30): Promise<Intervention[]> {
    const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;
    const db = this.ensureDB();

    return await db.getAllFromIndex(
      'interventions',
      'by-user-date',
      IDBKeyRange.bound([userId, cutoffDate], [userId, Date.now()])
    );
  }

  async getInterventionTemplates(): Promise<InterventionTemplate[]> {
    return await this.ensureDB().getAll('intervention_templates');
  }

  // Knowledge Graph operations
  async addGraphNode(node: GraphNode): Promise<void> {
    await this.ensureDB().put('graph_nodes', node);
  }

  async addGraphEdge(edge: GraphEdge): Promise<void> {
    await this.ensureDB().put('graph_edges', edge);
  }

  async getGraphNodes(userId: string, type?: string): Promise<GraphNode[]> {
    const db = this.ensureDB();

    if (type) {
      return await db.getAllFromIndex('graph_nodes', 'by-user-type', [userId, type]);
    }

    const allNodes = await db.getAll('graph_nodes');
    return allNodes.filter((node) => node.properties.user_id === userId);
  }

  async getGraphEdgesByNode(nodeId: string): Promise<{
    outgoing: GraphEdge[];
    incoming: GraphEdge[];
  }> {
    const db = this.ensureDB();

    const outgoing = await db.getAllFromIndex('graph_edges', 'by-source', nodeId);
    const incoming = await db.getAllFromIndex('graph_edges', 'by-target', nodeId);

    return { outgoing, incoming };
  }

  async getKnowledgeGraph(userId: string): Promise<KnowledgeGraph> {
    const nodes = await this.getGraphNodes(userId);
    const db = this.ensureDB();
    const allEdges = await db.getAll('graph_edges');

    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = allEdges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    );

    return {
      user_id: userId,
      nodes: new Map(nodes.map((n) => [n.id, n])),
      edges: new Map(edges.map((e) => [e.id, e])),
      last_updated: Date.now()
    };
  }

  // Update knowledge graph from mood entry
  private async updateKnowledgeGraphFromMood(entry: MoodEntry): Promise<void> {
    const userId = entry.user_id;

    // Create mood node
    const moodNode: GraphNode = {
      id: `mood_${entry.entry_id}`,
      type: 'mood',
      label: `Mood at ${new Date(entry.timestamp).toLocaleTimeString()}`,
      properties: {
        user_id: userId,
        vad: entry.vad,
        flow_probability: entry.flow_probability,
        timestamp: entry.timestamp
      },
      created_at: Date.now(),
      updated_at: Date.now()
    };

    await this.addGraphNode(moodNode);

    // Create edges based on context
    if (entry.context?.activity) {
      // Link to activity context
      const activityNodeId = `context_activity_${entry.context.activity}`;
      await this.addGraphEdge({
        id: `${moodNode.id}_to_${activityNodeId}`,
        source: activityNodeId,
        target: moodNode.id,
        type: 'correlates_with',
        weight: 0.5,
        properties: {},
        created_at: Date.now(),
        updated_at: Date.now()
      });
    }

    // If in flow state, create flow state node
    if (entry.flow_probability > 0.6) {
      const flowNode: GraphNode = {
        id: `flow_${entry.entry_id}`,
        type: 'flow_state',
        label: 'Flow State',
        properties: {
          user_id: userId,
          quality: entry.flow_probability,
          timestamp: entry.timestamp
        },
        created_at: Date.now(),
        updated_at: Date.now()
      };

      await this.addGraphNode(flowNode);

      await this.addGraphEdge({
        id: `${moodNode.id}_leads_to_${flowNode.id}`,
        source: moodNode.id,
        target: flowNode.id,
        type: 'leads_to',
        weight: entry.flow_probability,
        properties: {},
        created_at: Date.now(),
        updated_at: Date.now()
      });
    }
  }

  // Data management operations
  async deleteAllUserData(userId: string): Promise<void> {
    const db = this.ensureDB();

    // Delete from each store
    const stores = [
      'mood_entries',
      'circadian_data',
      'personality_responses',
      'flow_sessions',
      'interventions',
      'graph_nodes',
      'graph_edges'
    ];

    for (const storeName of stores) {
      const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
      const allKeys = await store.getAllKeys();

      for (const key of allKeys) {
        const record = await store.get(key);
        if (record && record.user_id === userId) {
          await store.delete(key);
        }
      }
    }

    // Delete user and personality profile
    await db.delete('users', userId);
    await db.delete('personality_profiles', userId);

    console.log(`All data deleted for user: ${userId}`);
  }
}

// Export singleton instance
export const db = new DatabaseService();
