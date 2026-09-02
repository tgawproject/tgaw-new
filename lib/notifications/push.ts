import webpush from "web-push";

function ensureVapid() {
	const pub = process.env.VAPID_PUBLIC_KEY;
	const priv = process.env.VAPID_PRIVATE_KEY;
	const contact = process.env.VAPID_CONTACT_EMAIL ?? "mailto:admin@tgaw.app";
	if (pub && priv) {
		try {
			webpush.setVapidDetails(contact, pub, priv);
		} catch {
			// already set or invalid — swallow
		}
	}
}

export async function sendPush(
	subscription: webpush.PushSubscription,
	title: string,
	body: string,
) {
	ensureVapid();
	if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
		console.error("[ERROR] VAPID keys missing — skipping push");
		return;
	}
	await webpush.sendNotification(subscription, JSON.stringify({ title, body }));
}
