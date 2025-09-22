export interface User {
  id: string;
  handle: string; // unique username like @alice
  displayName: string;
  createdAt: string; // ISO timestamp
}

export interface Tweet {
  id: string;
  userId: string;
  body: string;
  createdAt: string; // ISO timestamp
}
