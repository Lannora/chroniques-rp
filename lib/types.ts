export type Character = {
    id: number;
    server_id: string | null;
    server_name: string | null;
    name: string | null;
    avatar_url: string | null;
    created_at: string;
    backstory: string | null;
};

export type DiscordServer = {
  id: string;
  name: string;
  icon: string | null;
};