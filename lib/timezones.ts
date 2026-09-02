export function getAllTimezones(): string[] {
  try {
    const supported = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone")
    if (supported && supported.length > 0) return supported
  } catch {}
  // Fallback curtailed list if old runtime
  return [
    "UTC",
    "Africa/Abidjan","Africa/Accra","Africa/Addis_Ababa","Africa/Algiers","Africa/Cairo","Africa/Casablanca","Africa/Johannesburg","Africa/Lagos","Africa/Nairobi","Africa/Tunis",
    "America/Anchorage","America/Bogota","America/Chicago","America/Denver","America/Godthab","America/Guatemala","America/Halifax","America/Lima","America/Los_Angeles","America/Mexico_City","America/New_York","America/Phoenix","America/Sao_Paulo","America/St_Johns","America/Toronto","America/Vancouver",
    "Asia/Bahrain","Asia/Bangkok","Asia/Beirut","Asia/Colombo","Asia/Dubai","Asia/Hong_Kong","Asia/Jerusalem","Asia/Karachi","Asia/Kolkata","Asia/Riyadh","Asia/Seoul","Asia/Shanghai","Asia/Singapore","Asia/Tokyo",
    "Australia/Adelaide","Australia/Brisbane","Australia/Melbourne","Australia/Perth","Australia/Sydney",
    "Europe/Amsterdam","Europe/Athens","Europe/Berlin","Europe/Brussels","Europe/Bucharest","Europe/Budapest","Europe/Copenhagen","Europe/Dublin","Europe/Helsinki","Europe/Istanbul","Europe/Lisbon","Europe/London","Europe/Madrid","Europe/Paris","Europe/Prague","Europe/Rome","Europe/Stockholm","Europe/Warsaw","Europe/Zurich",
    "Pacific/Auckland","Pacific/Fiji","Pacific/Honolulu","Pacific/Tongatapu",
  ]
}

export function formatInTimezone(date: Date, tz: string, locale = "en-GB") {
  try {
    return new Intl.DateTimeFormat(locale, { timeZone: tz, dateStyle: "medium", timeStyle: "short" }).format(date)
  } catch {
    return date.toLocaleString()
  }
}
