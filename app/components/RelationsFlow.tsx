"use client";

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
} from 'reactflow';

// N'oublie pas d'importer les styles de la librairie !
import 'reactflow/dist/style.css';
import { type Character } from '@/lib/types';
import CharacterNode from '@/app/components/CharacterNode';

// On définit le type de nos relations pour plus de clarté
type Relationship = {
  id: number;
  source_character_id: number;
  target_character_id: number;
  relationship_type: string;
};

// On définit les props que notre composant reçoit de la page serveur
interface RelationsFlowProps {
  initialCharacters: (Character & { id: number })[];
  initialRelationships: Relationship[];
}

export default function RelationsFlow({ initialCharacters, initialRelationships }: RelationsFlowProps) {

  // --- ÉTAPE 1 : TRANSFORMATION DES DONNÉES ---

  // On crée les "noeuds" initiaux à partir de nos personnages
  const initialNodes: Node[] = useMemo(() => initialCharacters.map((character, index) => ({
    id: character.id.toString(), // L'id doit être une chaîne de caractères
    type: 'characterNode',       // On spécifie qu'on veut utiliser notre futur composant custom
    position: { x: (index % 5) * 200, y: Math.floor(index / 5) * 200 }, // Positionnement simple en grille
    data: { 
        name: character.name, 
        avatarUrl: character.avatar_url 
    },
  })), [initialCharacters]);

  // On crée les "liens" initiaux à partir de nos relations
  const initialEdges: Edge[] = useMemo(() => initialRelationships.map((rel) => ({
    id: `rel-${rel.id}`,
    source: rel.source_character_id.toString(), // L'id du personnage source
    target: rel.target_character_id.toString(), // L'id du personnage cible
    label: rel.relationship_type, // Le texte qui s'affichera sur le lien
    animated: true,
  })), [initialRelationships]);
  
  // --- ÉTAPE 2 : GESTION DE L'ÉTAT DE REACT FLOW ---
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Permet d'ajouter des liens manuellement (pour plus tard)
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // On dit à React Flow quel composant utiliser pour notre type de noeud custom
  const nodeTypes = useMemo(() => ({ characterNode: CharacterNode }), []);

  // --- ÉTAPE 3 : AFFICHAGE DU GRAPHE ---

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView // Centre la vue sur l'ensemble des noeuds au chargement
      className="bg-gray-800"
    >
      <Controls />
      <Background gap={16} color="#4a5568" />
    </ReactFlow>
  );
}