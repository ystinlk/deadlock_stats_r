import { fetchWithRetry } from "@/utils/api";

export interface SteamProfile {
  account_id: number;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
}

export async function getProfileData(accountIds: number[]): Promise<Record<number, SteamProfile>> {
  if (!accountIds.length) return {};

  try {
    const ids = accountIds.join(",");
    const profiles: SteamProfile[] = await fetchWithRetry(
      `https://api.deadlock-api.com/v1/players/steam?account_ids=${ids}`,
      { next: { revalidate: 3600 } }
    );

    if (!Array.isArray(profiles)) return {};

    // Упаковываем в словарь для мгновенного доступа по ID
    return profiles.reduce((acc, profile) => {
      acc[profile.account_id] = profile;
      return acc;
    }, {} as Record<number, SteamProfile>);
  } catch (error) {
    console.error("Ошибка при получении профилей Steam:", error);
    return {};
  }
}