export type Character = {
  id: number;
  user_id: string;
  avatar_url: string | null;
  created_at: string;
  backstory: string | null;
  server_id: string | null;
  server_name: string | null;
  traits: string[] | null;
  secrets: string | null;
};

export type DiscordServer = {
  id: string;
  name: string;
  icon: string | null;
};

export type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: number;
};