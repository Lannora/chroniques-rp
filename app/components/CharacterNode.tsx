"use client";

import Image from 'next/image';
import { Handle, Position, type NodeProps } from 'reactflow';

// Les données que notre noeud reçoit (spécifiées dans RelationsFlow)
type CharacterNodeData = {
    name: string | null;
    avatarUrl: string | null;
};

export default function CharacterNode({ data }: NodeProps<CharacterNodeData>) {
  return (
    <div className="bg-gray-700 p-2 rounded-lg border-2 border-gray-600 shadow-lg w-36">
      {/* Handle est le "point d'ancrage" pour les liens entrants et sortants */}
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />

      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16 mb-2">
          <Image
            src={data.avatarUrl || '/default-avatar.png'}
            alt={`Avatar de ${data.name}`}
            fill
            className="rounded-full object-cover"
            sizes="64px"
          />
        </div>
        <p className="text-white text-center font-bold text-sm truncate w-full">{data.name}</p>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
    </div>
  );
}