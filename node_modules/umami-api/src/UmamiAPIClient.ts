import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { TTimePeriod } from "./utils/time-periods";
import axios from "axios";
import { convertPeriodToTime } from "./utils/time-periods";

const DEFAULT_USER_AGENT =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:102.0) Gecko/20100101 Firefox/102.0";

type TUnit = "year" | "month" | "day" | "hour";
type TMetricType =
	| "url"
	| "referrer"
	| "browser"
	| "os"
	| "device"
	| "country"
	| "event"
	| "language"
	| "utm_source"
	| "utm_medium"
	| "utm_campaign"
	| "utm_content"
	| "utm_term"
	| "ref";

interface IAuthData {
	token: string;
	user: {
		user_id: number;
		username: string;
		is_admin: boolean;
		iat?: number;
	};
}

interface ITrackedWebsite {
	website_id: number;
	website_uuid: string;
	user_id: number;
	name: string;
	domain: string;
	share_id: string | null;
	created_at: string;
}

interface IStats {
	pageviews: { value: number; change: number };
	uniques: { value: number; change: number };
	bounces: { value: number; change: number };
	totaltime: { value: number; change: number };
}

interface IPageViews {
	/**
	 * @param t The time period of the data
	 * @param y The amount of page views in the time period
	 */
	pageviews: { t: string; y: number }[];
	/**
	 * @param t The time period of the data
	 * @param y The amount of sessions in the time period
	 */
	sessions: { t: string; y: number }[];
}

/**
 * @param x The name of the event
 * @param t The time period of the data
 * @param y The amount of events in the time period
 */
interface IEvent {
	x: string;
	t: string;
	y: number;
}

/**
 * @param x The metric's value
 * @param y The amount of this metric's value in the period of time
 */
interface IMetric {
	x: string | null;
	y: number;
}

interface IActiveVisitor {
	x: number;
}

interface IUserAccount {
	user_id: number;
	username: string;
	is_admin: boolean;
	created_at: string;
	updated_at: string;
}

interface IPageViewPayload {
	website: string;
	url: string;
	referrer?: string;
	hostname: string;
	language?: string;
	screen?: string;
}
interface IEventPayload extends Omit<IPageViewPayload, "referrer"> {
	event_type: string;
	event_value: string;
}

function _richError(message: string, cause?: any, options?: any): Error {
	if (!options) options = "None specified";
	options = JSON.stringify(options);

	if (!cause) cause = "None specified";
	cause = cause.toString();

	return new Error(`${message}\nOptions: ${options}\nStacktrace:`, { cause });
}

class TrackedWebsite<A extends boolean> {
	private readonly _apiClient: UmamiAPIClient<A>;
	public readonly website_id: number;
	public readonly website_uuid: string;
	public user_id: number;
	public name: string;
	public domain: string;
	public share_id: string | null;
	public created_at: string;

	constructor(apiClient: UmamiAPIClient<A>, data: ITrackedWebsite) {
		this._apiClient = apiClient;
		Object.assign(this, data);
	}

	/**
	 * Updates the website.
	 * @param options.domain The domain name of the website (e.g. umami.is)
	 * @param options.name The name of the website (usually the same as the domain)
	 * @param options.enable_share_url Whether or not to enable public sharing.
	 * @returns
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/website/index.js#L30 Relevant Umami source code}
	 */
	public async update(options: {
		domain: string;
		name: string;
		enable_share_url?: boolean;
	}): Promise<TrackedWebsite<A>> {
		const data = await this._apiClient.updateWebsite(this.website_id, options);
		Object.assign(this, data);
		return this;
	}

	/**
	 * Resets the website's stats
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/website/[id]/reset.js Relevant Umami source code}
	 */
	public async reset(): Promise<TrackedWebsite<A>> {
		await this._apiClient.resetWebsite(this.website_id);
		return this;
	}

	/**
	 * Deletes the website
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/website/[id]/index.js Relevant Umami source code}
	 */
	public async delete(): Promise<void> {
		await this._apiClient.deleteWebsite(this.website_id);
	}

	/**
	 * Gets the stats of the website from a specified time period
	 * @param options.period The time period of stats to return
	 * @param options.url Filter stats by URL
	 * @param options.referrer Filter stats by referrer
	 * @param options.os Filter stats by OS
	 * @param options.browser Filter stats by browser
	 * @param options.device Filter stats by device
	 * @param options.country Filter stats by country
	 * @returns The website's stats from the specified time period
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/website/[id]/stats.js Relevant Umami source code}
	 */
	public async getStats(options?: {
		period?: TTimePeriod;
		url?: string;
		referrer?: string;
		os?: string;
		browser?: string;
		device?: string;
		country?: string;
	}): Promise<IStats> {
		return await this._apiClient.getStats(this.website_id, options);
	}

	/**
	 * Gets the pageviews of the website from a specified time period
	 * @param options.period The time period of pageviews to return
	 * @param options.unit The interval of time/precision of the returned pageviews
	 * @param options.tz The timezone you're in (defaults to "America/Toronto")
	 * @param options.url Filter pageviews by URL
	 * @param options.referrer Filter pageviews by referrer
	 * @param options.os Filter pageviews by OS
	 * @param options.browser Filter pageviews by browser
	 * @param options.device Filter pageviews by device
	 * @param options.country Filter pageviews by country
	 * @returns The website's pageviews from the specified time period
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/website/[id]/pageviews.js Relevant Umami source code}
	 */
	public async getPageviews(options?: {
		period?: TTimePeriod;
		unit?: TUnit;
		tz?: string;
		url?: string;
		referrer?: string;
		os?: string;
		browser?: string;
		device?: string;
		country?: string;
	}): Promise<IPageViews> {
		return await this._apiClient.getPageviews(this.website_id, options);
	}

	/**
	 * Gets the events of the website from a specified time period
	 * @param options.period The time period of events to return
	 * @param options.unit The interval of time/precision of the returned events
	 * @param options.tz The timezone you're in (defaults to "America/Toronto")
	 * @param options.url The url where the event happened.
	 * @param options.event_type The type of event to request.
	 * @returns An array of events from the specified time period
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/website/[id]/events.js Relevant Umami source code}
	 */
	public async getEvents(options?: {
		period?: TTimePeriod;
		unit?: TUnit;
		tz?: string;
		url?: string;
		event_type?: string;
	}): Promise<IEvent[]> {
		return await this._apiClient.getEvents(this.website_id, options);
	}

	/**
	 * Gets the total number of events by a filter
	 * @param options.filter The field to filter by
	 * @param options.value The value to match the field against
	 * @param options.period The time period of events to return
	 * @returns The total number of events matching the filter
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/websites/index.js Relevant Umami source code}
	 */
	public async getEventsByName(
		name: string,
		options: { period?: TTimePeriod; unit?: TUnit; tz?: string; url?: string; event_type?: string }
	): Promise<IEvent[]> {
		return await this._apiClient.getEventsByName(this.website_id, name, options);
	}

	/**
	 * Gets a type of metrics of the website from a specified time period
	 * @param options.period The time period of events to return
	 * @param options.type The type of metric to get. Defaults to url
	 * @param options.url Filter metrics by URL
	 * @param options.referrer Filter metrics by referrer
	 * @param options.os Filter metrics by OS
	 * @param options.browser Filter metrics by browser
	 * @param options.device Filter metrics by device
	 * @param options.country Filter metrics by country
	 * @returns An array of metrics from the specified time period
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/website/[id]/metrics.js Relevant Umami source code}
	 */
	public async getMetrics(options?: {
		period?: TTimePeriod;
		type?: TMetricType;
		url?: string;
		referrer?: string;
		os?: string;
		browser?: string;
		device?: string;
		country?: string;
	}): Promise<IMetric[]> {
		return await this._apiClient.getMetrics(this.website_id, options);
	}

	/**
	 * Gets the active visitors of a website
	 * @returns
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/website/[id]/active.js Relevant Umami source code}
	 */
	public async getActiveVisitors(): Promise<IActiveVisitor[]> {
		return await this._apiClient.getActiveVisitors(this.website_id);
	}
}

class UserAccount<A extends boolean> {
	private readonly _apiClient: UmamiAPIClient<A>;
	public readonly user_id: number;
	public username: string;
	public is_admin: boolean;
	public readonly created_at: string;
	public updated_at: string;

	constructor(apiClient: UmamiAPIClient<A>, data: IUserAccount) {
		this._apiClient = apiClient;
		Object.assign(this, data);
	}

	/**
	 * Updates a user account
	 * @param options.username New username (admin only)
	 * @param options.password New password
	 * @param options.is_admin New admin status (admin only)
	 * @returns The user account
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/account/index.js Relevant Umami source code}
	 */
	public async update(options: {
		username: string;
		password: string;
		is_admin: boolean;
	}): Promise<UserAccount<A>> {
		const data = await this._apiClient.updateAccount(this.user_id, options);
		Object.assign(this, data);
		return this;
	}

	/**
	 * Updates a user account password
	 * @param options.current_password Current password
	 * @param options.new_password New password
	 * @returns The user account
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/account/password.js Relevant Umami source code}
	 */
	public async changePassword(options: {
		current_password: string;
		new_password: string;
	}): Promise<UserAccount<A>> {
		await this._apiClient.changePassword(this.user_id, options);
		return this;
	}

	/**
	 * Deletes the user account (admin only)
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/account/[id].js Relevant Umami source code}
	 */
	public async deleteAccount(): Promise<void> {
		await this._apiClient.deleteAccount(this.user_id);
	}
}

/**
 * Umami API Client
 */
export default class UmamiAPIClient<A extends boolean> {
	private readonly _axios: AxiosInstance;
	private readonly _auth: Promise<AxiosResponse<IAuthData>>;
	private readonly _returnClasses: A;
	private _lastAuthCheck: number = Date.now();
	private _defaultPeriod: TTimePeriod = "24h";
	private _defaultUnit: TUnit = "hour";
	private _defaultTZ: string = "America/Toronto";
	private _defaultMetricType: TMetricType = "url";
	private _defaultUserAgent: string = DEFAULT_USER_AGENT;

	public setDefaultPeriod(period: TTimePeriod): void {
		this._defaultPeriod = period;
	}

	public setDefaultUnit(unit: TUnit): void {
		this._defaultUnit = unit;
	}

	public setDefaultTZ(tz: string): void {
		this._defaultTZ = tz;
	}

	public setDefaultMetricType(metricType: TMetricType): void {
		this._defaultMetricType = metricType;
	}

	public setDefaultUserAgent(userAgent: string): void {
		this._defaultUserAgent = userAgent;
	}

	public async getCurrentUser(): Promise<IAuthData["user"]> {
		return (await this._auth).data.user;
	}

	/**
	 * @param server The Umami installation hostname (e.g. app.umami.is). The protocol, if present, will be removed.
	 * @param username Username of the user you want to login
	 * @param password Password of the user you want to login
	 * @param returnClasses Return classes instead of plain-old JavaScript objects when getting websites or accounts.
	 * @returns An authenticated class instance
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/auth/login.js Relevant Umami source code}
	 */
	constructor(server: string, username: string, password: string, returnClasses: A) {
		if (!server) throw new Error("A server hostname is required");
		server = server.replace(/https?:\/\//, "").replace(/\/$/, "");
		if (!username || !password) throw new Error("A username and a password are required");

		this._returnClasses = returnClasses;

		this._axios = axios.create({
			baseURL: `https://${server}/api`,
			timeout: 1000,
		});

		this._axios.interceptors.request.use(this._verifyAuth.bind(this));

		this._auth = this._axios.post("/auth/login", { username, password }).catch((error) => {
			throw _richError("Login failed", error, { server, username });
		});
	}

	private async _verifyAuth(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
		if (config.url == "/auth/login" || config.url == "/collect") return config;

		const auth = await this._auth;

		config.headers = { ...config.headers, Authorization: `Bearer ${auth.data.token}` };

		if (config.url == "/auth/verify") return config;

		if (this._lastAuthCheck + 60 * 60 * 1000 < Date.now()) {
			this._lastAuthCheck = Date.now();

			try {
				await this._axios.get("/auth/verify");
			} catch (error) {
				throw _richError("Could not verify authentication", error, { axiosConfig: config });
			}
		}

		return config;
	}

	/**
	 * Collects a pageview
	 * @param type The type of event to send
	 * @param payload The payload of the pageview
	 * @param userAgent Value of the User-Agent header. Necessary for platform detection. Defaults to Firefox on Mac OS on a laptop
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/collect.js#L75 Relevant Umami source code}
	 */
	public async collect(
		type: "pageview",
		payload: IPageViewPayload,
		userAgent?: string
	): Promise<string>;
	/**
	 * Collects an event
	 * @param type The type of event to send
	 * @param payload The payload of the event
	 * @param userAgent Value of the User-Agent header. Necessary for platform detection. Defaults to Firefox on Mac OS on a laptop
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/collect.js#L77 Relevant Umami source code}
	 */
	public async collect(type: "event", payload: IEventPayload, userAgent?: string): Promise<string>;
	public async collect(
		type: "pageview" | "event",
		payload: IEventPayload | IPageViewPayload,
		userAgent: string = this._defaultUserAgent
	): Promise<string> {
		try {
			if (!userAgent) throw new Error("A user agent is required. See https://umami.is/docs/api");

			const { data } = await this._axios.post(
				"/collect",
				{ type, payload },
				{ headers: { "User-Agent": userAgent } }
			);
			return data;
		} catch (error) {
			throw _richError("Could not collect", error, { type, payload, userAgent });
		}
	}

	/**
	 * Collects a pageview
	 * @param server The Umami installation hostname (e.g. app.umami.is). The protocol, if present, will be removed.
	 * @param type The type of event to send
	 * @param payload The payload of the pageview
	 * @param userAgent Value of the User-Agent header. Necessary for platform detection. Defaults to Firefox on Mac OS on a laptop
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/collect.js#L75 Relevant Umami source code}
	 */
	public static async collect(
		server: string,
		type: "pageview",
		payload: IPageViewPayload,
		userAgent?: string
	): Promise<string>;
	/**
	 * Collects an event
	 * @param server The Umami installation hostname (e.g. app.umami.is). The protocol, if present, will be removed.
	 * @param type The type of event to send
	 * @param payload The payload of the event
	 * @param userAgent Value of the User-Agent header. Necessary for platform detection. Defaults to Firefox on Mac OS on a laptop
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/collect.js#L77 Relevant Umami source code}
	 */
	public static async collect(
		server: string,
		type: "event",
		payload: IEventPayload,
		userAgent?: string
	): Promise<string>;
	public static async collect(
		server: string,
		type: "pageview" | "event",
		payload: IEventPayload | IPageViewPayload,
		userAgent: string = DEFAULT_USER_AGENT
	): Promise<string> {
		server = server.replace(/https?:\/\//, "").replace(/\/$/, "");

		try {
			if (!userAgent) throw new Error("A user agent is required. See https://umami.is/docs/api");

			const { data } = await axios.post(
				`https://${server}/api/collect`,
				{ type, payload },
				{ headers: { "User-Agent": userAgent } }
			);
			return data;
		} catch (error) {
			throw _richError("Could not collect", error, { type, payload, userAgent });
		}
	}

	/**
	 * Creates a new website and returns its information.
	 * @param options.domain The domain name of the website (e.g. umami.is)
	 * @param options.name The name of the website (usually the same as the domain)
	 * @param options.enable_share_url Whether or not to enable public sharing.
	 * @returns The new website's information
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/website/index.js#L36 Relevant Umami source code}
	 */
	public async createWebsite(options: {
		domain: string;
		name: string;
		enable_share_url?: boolean;
	}): Promise<A extends true ? TrackedWebsite<A> : ITrackedWebsite>;
	public async createWebsite(options: {
		domain: string;
		name: string;
		enable_share_url?: boolean;
	}): Promise<ITrackedWebsite | TrackedWebsite<A>> {
		try {
			const { data } = await this._axios.post("/website", options);
			if (this._returnClasses) {
				return new TrackedWebsite(this, data);
			}
			return data;
		} catch (error) {
			throw _richError("Could not create website", error, { options });
		}
	}

	/**
	 * Updates a website and returns its information.
	 * @param website_id The website's ID (not UUID)
	 * @param options.domain The domain name of the website (e.g. umami.is)
	 * @param options.name The name of the website (usually the same as the domain)
	 * @param options.enable_share_url Whether or not to enable public sharing.
	 * @returns The website's information
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/website/index.js#L30 Relevant Umami source code}
	 */
	public async updateWebsite(
		website_id: number,
		options: {
			domain: string;
			name: string;
			enable_share_url?: boolean;
		}
	): Promise<A extends true ? TrackedWebsite<A> : ITrackedWebsite>;
	public async updateWebsite(
		website_id: number,
		options: {
			domain: string;
			name: string;
			enable_share_url?: boolean;
		}
	): Promise<ITrackedWebsite | TrackedWebsite<A>> {
		try {
			const { data } = await this._axios.post("/website", { website_id, ...options });
			if (this._returnClasses) {
				return new TrackedWebsite(this, data);
			}
			return data;
		} catch (error) {
			throw _richError("Could not update website", error, { website_id, options });
		}
	}

	/**
	 * Gets the first website that gets returned by Umami
	 * @returns The first website
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/websites/index.js Relevant Umami source code}
	 */
	public async getWebsite(): Promise<A extends true ? TrackedWebsite<A> : ITrackedWebsite>;
	/**
	 * Gets a website by its ID (not UUID)
	 * @param website_id The website's ID (not UUID)
	 * @returns The website
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/website/[id]/index.js Relevant Umami source code}
	 */
	public async getWebsite(
		website_id: number
	): Promise<A extends true ? TrackedWebsite<A> : ITrackedWebsite>;
	public async getWebsite(website_id: number = null): Promise<ITrackedWebsite | TrackedWebsite<A>> {
		try {
			if (website_id == null) {
				const websites = await this.getWebsites();
				if (this._returnClasses) {
					return new TrackedWebsite(this, websites[0]);
				}
				return websites[0];
			}

			const { data } = await this._axios.get(`/website/${website_id}`);
			if (this._returnClasses) {
				return new TrackedWebsite(this, data);
			}
			return data;
		} catch (error) {
			throw _richError("Could not get website", error, { website_id });
		}
	}

	/**
	 * Gets a website by a property
	 * @param key The property to check
	 * @param value The value to check the property against
	 * @returns The website
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/websites/index.js Relevant Umami source code}
	 *
	 * @example
	 * Get a website by domain name
	 * ```ts
	 * const website = await instance.getWebsiteBy("domain", "example.com");
	 * ```
	 */
	public async getWebsiteBy(
		key: keyof ITrackedWebsite,
		value: string | number
	): Promise<A extends true ? TrackedWebsite<A> : ITrackedWebsite>;
	public async getWebsiteBy(
		key: keyof ITrackedWebsite,
		value: string | number
	): Promise<ITrackedWebsite | TrackedWebsite<A>> {
		if (key == "share_id") {
			try {
				const { data } = await this._axios.get(`/share/${value}`);
				const website = await this.getWebsite(data.websiteId);
				if (this._returnClasses) {
					return new TrackedWebsite(this, website);
				}
				return website;
			} catch (error) {
				throw _richError("Could not find website", error, { key, value });
			}
		}

		if (key == "website_id") {
			try {
				const data = await this.getWebsite(value as number);
				if (this._returnClasses) {
					return new TrackedWebsite(this, data);
				}
				return data;
			} catch (error) {
				throw _richError("Could not find website", error, { key, value });
			}
		}

		const websites = await this.getWebsites();
		const website = websites.find((website) => website[key] == value);
		if (!website) {
			throw _richError("Could not find website", null, { key, value });
		}
		if (this._returnClasses) {
			return new TrackedWebsite(this, website);
		}
		return website;
	}

	/**
	 * Resets a website's stats
	 * @param website_id The website's ID (not UUID)
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/website/[id]/reset.js Relevant Umami source code}
	 */
	public async resetWebsite(
		website_id: number
	): Promise<A extends true ? TrackedWebsite<A> : ITrackedWebsite>;
	public async resetWebsite(website_id: number): Promise<ITrackedWebsite | TrackedWebsite<A>> {
		try {
			const { data } = await this._axios.post(`/website/${website_id}/reset`);
			if (this._returnClasses) {
				return new TrackedWebsite(this, data);
			}
			return data;
		} catch (error) {
			throw _richError("Could not reset website", error, { website_id });
		}
	}

	/**
	 * Deletes a website
	 * @param website_id The website's ID (not UUID)
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/website/[id]/index.js Relevant Umami source code}
	 */
	public async deleteWebsite(website_id: number): Promise<void> {
		try {
			await this._axios.delete(`/website/${website_id}`);
		} catch (error) {
			throw _richError("Could not delete website", error, { website_id });
		}
	}

	/**
	 * Gets tracked websites
	 * @param options.include_all Whether or not to include all websites (admin only)
	 * @param options.user_id The user to query websites from (admin only, if not your own user id)
	 * @returns An array of tracked websites
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/websites/index.js Relevant Umami source code}
	 */
	public async getWebsites(options?: {
		include_all?: boolean;
		user_id?: number;
	}): Promise<A extends true ? TrackedWebsite<A>[] : ITrackedWebsite[]>;
	public async getWebsites(options?: {
		include_all?: boolean;
		user_id?: number;
	}): Promise<ITrackedWebsite[] | TrackedWebsite<A>[]> {
		try {
			const { data } = await this._axios.get("/websites", { params: options });
			if (this._returnClasses) {
				return (data as ITrackedWebsite[]).map((data) => new TrackedWebsite(this, data));
			}
			return data;
		} catch (error) {
			throw _richError("Could not get websites", error, { options });
		}
	}

	/**
	 * Gets the stats of a website from a specified time period using it's ID
	 * @param website_id The website's ID (not UUID)
	 * @param options.period The time period of stats to return
	 * @param options.url Filter stats by URL
	 * @param options.referrer Filter stats by referrer
	 * @param options.os Filter stats by OS
	 * @param options.browser Filter stats by browser
	 * @param options.device Filter stats by device
	 * @param options.country Filter stats by country
	 * @returns The website's stats from the specified time period
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/website/[id]/stats.js Relevant Umami source code}
	 */
	public async getStats(
		website_id: number,
		options?: {
			period?: TTimePeriod;
			url?: string;
			referrer?: string;
			os?: string;
			browser?: string;
			device?: string;
			country?: string;
		}
	): Promise<IStats> {
		const { start_at, end_at } = convertPeriodToTime(options?.period ?? this._defaultPeriod);
		const params = { ...options, start_at, end_at };

		try {
			const { data } = await this._axios.get(`/website/${website_id}/stats`, { params });
			return data;
		} catch (error) {
			throw _richError("Could not get stats", error, { website_id, params });
		}
	}

	/**
	 * Gets the pageviews of a website from a specified time period using it's ID
	 * @param website_id The website's ID (not UUID)
	 * @param options.period The time period of pageviews to return
	 * @param options.unit The interval of time/precision of the returned pageviews
	 * @param options.tz The timezone you're in (defaults to "America/Toronto")
	 * @param options.url Filter pageviews by URL
	 * @param options.referrer Filter pageviews by referrer
	 * @param options.os Filter pageviews by OS
	 * @param options.browser Filter pageviews by browser
	 * @param options.device Filter pageviews by device
	 * @param options.country Filter pageviews by country
	 * @returns The website's pageviews from the specified time period
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/website/[id]/pageviews.js Relevant Umami source code}
	 */
	public async getPageviews(
		website_id: number,
		options?: {
			period?: TTimePeriod;
			unit?: TUnit;
			tz?: string;
			url?: string;
			referrer?: string;
			os?: string;
			browser?: string;
			device?: string;
			country?: string;
		}
	): Promise<IPageViews> {
		const { start_at, end_at } = convertPeriodToTime(options?.period ?? this._defaultPeriod);
		const unit = options?.unit ?? this._defaultUnit;
		const tz = options?.tz ?? this._defaultTZ;
		const params = { ...options, start_at, end_at, unit, tz };

		try {
			const { data } = await this._axios.get(`/website/${website_id}/pageviews`, { params });
			return data;
		} catch (error) {
			throw _richError("Could not get pageviews", error, { website_id, params });
		}
	}

	/**
	 * Gets the events of a website from a specified time period using it's ID
	 * @param website_id The website's ID (not UUID)
	 * @param options.period The time period of events to return
	 * @param options.unit The interval of time/precision of the returned events
	 * @param options.tz The timezone you're in (defaults to "America/Toronto")
	 * @param options.url The url where the event happened.
	 * @param options.event_type The type of event to request.
	 * @returns An array of events from the specified time period
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/website/[id]/events.js Relevant Umami source code}
	 */
	public async getEvents(
		website_id: number,
		options?: { period?: TTimePeriod; unit?: TUnit; tz?: string; url?: string; event_type?: string }
	): Promise<IEvent[]> {
		const { start_at, end_at } = convertPeriodToTime(options?.period ?? this._defaultPeriod);
		const unit = options?.unit ?? this._defaultUnit;
		const tz = options?.tz ?? this._defaultTZ;
		const params = {
			start_at,
			end_at,
			unit,
			tz,
			url: options?.url,
			event_type: options?.event_type,
		};

		try {
			const { data } = await this._axios.get(`/website/${website_id}/events`, { params });
			return data;
		} catch (error) {
			throw _richError("Could not get events", error, { website_id, params });
		}
	}

	/**
	 * Gets the total number of events by a filter
	 * @param website_id The website's ID (not UUID)
	 * @param options.filter The field to filter by
	 * @param options.value The value to match the field against
	 * @param options.period The time period of events to return
	 * @returns The total number of events matching the filter
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/websites/index.js Relevant Umami source code}
	 */
	public async getEventsByName(
		website_id: number,
		name: string,
		options: { period?: TTimePeriod; unit?: TUnit; tz?: string; url?: string; event_type?: string }
	): Promise<IEvent[]> {
		try {
			const events = await this.getEvents(website_id, {
				period: options?.period,
				unit: options?.unit,
				tz: options?.tz,
				url: options?.url,
				event_type: options?.event_type,
			});

			return events.filter((event) => event.x == name);
		} catch (error) {
			throw _richError("Could not get events by name", error, { website_id, options });
		}
	}

	/**
	 * Gets a type of metrics of a website from a specified time period using it's ID
	 * @param website_id The website's ID (not UUID)
	 * @param options.period The time period of events to return
	 * @param options.type The type of metric to get. Defaults to url
	 * @param options.url Filter metrics by URL
	 * @param options.referrer Filter metrics by referrer
	 * @param options.os Filter metrics by OS
	 * @param options.browser Filter metrics by browser
	 * @param options.device Filter metrics by device
	 * @param options.country Filter metrics by country
	 * @returns An array of metrics from the specified time period
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/website/[id]/metrics.js Relevant Umami source code}
	 */
	public async getMetrics(
		website_id: number,
		options?: {
			period?: TTimePeriod;
			type?: TMetricType;
			url?: string;
			referrer?: string;
			os?: string;
			browser?: string;
			device?: string;
			country?: string;
		}
	): Promise<IMetric[]> {
		const { start_at, end_at } = convertPeriodToTime(options?.period ?? this._defaultPeriod);
		const type = options?.type ?? this._defaultMetricType;
		const params = { ...options, start_at, end_at, type };

		try {
			const { data } = await this._axios.get(`/website/${website_id}/metrics`, { params });
			return data;
		} catch (error) {
			throw _richError("Could not get metrics", error, { website_id, params });
		}
	}

	/**
	 * Gets the active visitors of a website
	 * @param website_id The website's ID (not UUID)
	 * @returns
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/website/[id]/active.js Relevant Umami source code}
	 */
	public async getActiveVisitors(website_id: number): Promise<IActiveVisitor[]> {
		try {
			const { data } = await this._axios.get(`/website/${website_id}/active`);
			return data;
		} catch (error) {
			throw _richError("Could not get active visitors", error, { website_id });
		}
	}

	/*** ADMIN ONLY FUNCTIONS ***/

	/**
	 * Creates a user account (admin only)
	 * @param options.username The username
	 * @param options.password The password
	 * @returns The user account
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/account/index.js Relevant Umami source code}
	 */
	public async createAccount(options: {
		username: string;
		password: string;
	}): Promise<A extends true ? UserAccount<A> : IUserAccount>;
	public async createAccount(options: {
		username: string;
		password: string;
	}): Promise<IUserAccount | UserAccount<A>> {
		try {
			const { data } = await this._axios.post("/account", options);
			if (this._returnClasses) {
				return new UserAccount(this, data);
			}
			return data;
		} catch (error) {
			throw _richError("Could not create account", error, { options });
		}
	}

	/**
	 * Updates a user account
	 * @param user_id User ID to update
	 * @param options.username New username (admin only)
	 * @param options.password New password
	 * @param options.is_admin New admin status (admin only)
	 * @returns The user account
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/account/index.js Relevant Umami source code}
	 */
	public async updateAccount(
		user_id: number,
		options: { username: string; password: string; is_admin: boolean }
	): Promise<A extends true ? UserAccount<A> : IUserAccount>;
	public async updateAccount(
		user_id: number,
		options: { username: string; password: string; is_admin: boolean }
	): Promise<IUserAccount | UserAccount<A>> {
		try {
			const { data } = await this._axios.post("/account", { user_id, ...options });
			if (this._returnClasses) {
				return new UserAccount(this, data);
			}
			return data;
		} catch (error) {
			throw _richError("Could not update account", error, { user_id, options });
		}
	}

	/**
	 * Updates a user account password
	 * @param user_id User ID to update
	 * @param options.current_password Current password
	 * @param options.new_password New password
	 * @returns The user account
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/account/password.js Relevant Umami source code}
	 */
	public async changePassword(
		user_id: number,
		options: { current_password: string; new_password: string }
	): Promise<A extends true ? UserAccount<A> : IUserAccount>;
	public async changePassword(
		user_id: number,
		options: { current_password: string; new_password: string }
	): Promise<IUserAccount | UserAccount<A>> {
		try {
			const { data } = await this._axios.post("/password", { user_id, ...options });
			return this._returnClasses ? new UserAccount(this, data) : data;
		} catch (error) {
			throw _richError("Could not update password", error, { user_id, options });
		}
	}

	/**
	 * Gets all the user accounts (admin only)
	 * @returns An array of all the user accounts
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/accounts/index.js Relevant Umami source code}
	 */
	public async getAccounts(): Promise<A extends true ? UserAccount<A>[] : IUserAccount[]>;
	public async getAccounts(): Promise<IUserAccount[] | UserAccount<A>[]> {
		try {
			const { data } = await this._axios.get("/accounts");
			if (this._returnClasses) {
				return (data as IUserAccount[]).map((data) => new UserAccount(this, data));
			}
			return data;
		} catch (error) {
			throw _richError("Could not get accounts", error);
		}
	}

	/**
	 * Gets a user account (admin only)
	 * @param user_id The user ID
	 * @returns The user account
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/account/[id].js Relevant Umami source code}
	 */
	public async getAccount(user_id: number): Promise<A extends true ? UserAccount<A> : IUserAccount>;
	public async getAccount(user_id: number): Promise<IUserAccount | UserAccount<A>> {
		try {
			const { data } = await this._axios.get(`/account/${user_id}`);
			if (this._returnClasses) {
				return new UserAccount(this, data);
			}
			return data;
		} catch (error) {
			throw _richError("Could not get account", error, { user_id });
		}
	}

	/**
	 * Deletes a user account (admin only)
	 * @param user_id The user ID
	 * @see {@link https://github.com/umami-software/umami/blob/master/pages/api/account/[id].js Relevant Umami source code}
	 */
	public async deleteAccount(user_id: number): Promise<void> {
		try {
			await this._axios.delete(`/account/${user_id}`);
		} catch (error) {
			throw _richError("Could not delete account", error, { user_id });
		}
	}
}
