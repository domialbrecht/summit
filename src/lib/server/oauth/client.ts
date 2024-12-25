import { sendTokenRevocationRequest, createOAuth2Request, sendTokenRequest } from './request';

import type { OAuth2Tokens } from './token';

export class OAuth2Client {
	public clientId: string;

	private clientPassword: string;
	private redirectURI: string | null;

	constructor(clientId: string, clientPassword: string, redirectURI: string | null) {
		this.clientId = clientId;
		this.clientPassword = clientPassword;
		this.redirectURI = redirectURI;
	}

	public createAuthorizationURL(
		authorizationEndpoint: string,
		state: string,
		scopes: string[]
	): URL {
		const url = new URL(authorizationEndpoint);
		url.searchParams.set('response_type', 'code');
		url.searchParams.set('client_id', this.clientId);
		if (this.redirectURI !== null) {
			url.searchParams.set('redirect_uri', this.redirectURI);
		}
		url.searchParams.set('state', state);
		if (scopes.length > 0) {
			url.searchParams.set('scope', scopes.join(' '));
		}
		return url;
	}

	public async validateAuthorizationCode(
		tokenEndpoint: string,
		code: string,
		codeVerifier: string | null
	): Promise<OAuth2Tokens> {
		const body = new URLSearchParams();
		body.set('grant_type', 'authorization_code');
		body.set('code', code);
		if (this.redirectURI !== null) {
			body.set('redirect_uri', this.redirectURI);
		}
		if (codeVerifier !== null) {
			body.set('code_verifier', codeVerifier);
		}
		body.set('client_id', this.clientId);
		body.set('client_secret', this.clientPassword);
		const request = createOAuth2Request(tokenEndpoint, body);
		const tokens = await sendTokenRequest(request);
		return tokens;
	}

	public async refreshAccessToken(
		tokenEndpoint: string,
		refreshToken: string,
		scopes: string[]
	): Promise<OAuth2Tokens> {
		const body = new URLSearchParams();
		body.set('grant_type', 'refresh_token');
		body.set('refresh_token', refreshToken);
		body.set('client_id', this.clientId);
		body.set('client_secret', this.clientPassword);
		if (scopes.length > 0) {
			body.set('scope', scopes.join(' '));
		}
		const request = createOAuth2Request(tokenEndpoint, body);
		const tokens = await sendTokenRequest(request);
		return tokens;
	}

	public async revokeToken(tokenRevocationEndpoint: string, token: string): Promise<void> {
		const body = new URLSearchParams();
		body.set('token', token);
		body.set('client_id', this.clientId);
		body.set('client_secret', this.clientPassword);
		const request = createOAuth2Request(tokenRevocationEndpoint, body);
		await sendTokenRevocationRequest(request);
	}
}

export enum CodeChallengeMethod {
	S256 = 0,
	Plain
}
