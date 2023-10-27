import { eq } from "drizzle-orm";
import { RequestHandler, Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { db } from "../../db";
import { users } from "../../db/schema";
import { signJwt } from "../../utils/auth.utils";
import Controller from "../../utils/interfaces/controller.interface";

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);

export class OauthController implements Controller {
  path: string;
  router: Router;
  constructor(path: string) {
    this.path = path;
    this.router = Router().all(path);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/google", this.token);
  }

  private token: RequestHandler<{}, {}, any> = async (req, res) => {
    const { code, firstName, lastName } = req.body;
    const { tokens } = await oAuth2Client.getToken(code);
    const loginTicket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token!,
    });

    if (!loginTicket.getPayload()?.email_verified) {
      return res.fail({ code: 401, i18n: { key: "authorization.email" } });
    }

    const email = loginTicket.getPayload()!.email!;

    const user =
      (await db.select().from(users).where(eq(users.email, email)))[0] ??
      (
        await db
          .insert(users)
          .values({
            email,
            firstName: loginTicket.getPayload()?.given_name,
            lastName: loginTicket.getPayload()?.family_name,
            profilePicture: loginTicket.getPayload()?.picture,
          })
          .returning()
      )[0];

    const { token, expirationDate } = signJwt(user);

    res.success({ data: { token, expirationDate, user } });
  };
}
