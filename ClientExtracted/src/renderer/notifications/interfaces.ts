export interface NotifyNotificationOptions {
  avatarImage: string;
  channel: string;
  content: string;
  id: string;
  imageUri: string;
  launchUri: string;
  msg: string;
  ssbFilename: string;
  subtitle: string;
  thread_ts?: string;
  title: string;
}

export interface WebappNotificationOptions extends NotifyNotificationOptions {
  interactive?: boolean;
  teamId: string;
}

export interface NativeNotificationOptions {
  avatarImage?: string;
  avatarImageWeb?: string;
  body: string;
  channel: string;
  icon?: string;
  id: string;
  imageUri?: string;
  interactive?: boolean;
  launchUri?: string;
  msg: string;
  soundName?: string;
  teamId: string;
  theme?: string;
  thread_ts?: string;
  title: string;
  userId?: string;
  bundleId?: string;
}
