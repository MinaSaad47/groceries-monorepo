import { Request, Response, Router } from "express";
import passport from "passport";
import { signJwt } from "../../utils/auth.utils";
import Controller from "../../utils/interfaces/controller.interface";
import log from "../../utils/logger";

export class AuthController implements Controller {
  public path: string;
  public router: Router;

  constructor(path: string) {
    this.path = path;
    this.router = Router().all(path);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/google",
      passport.authenticate("google", { scope: ["profile", "email"] })
    );
    this.router.get(
      "/google/callback",
      passport.authenticate("google", {
        failureRedirect: "/",
        session: false,
      }),
      this.login
    );
  }

  private login = async (req: Request, res: Response) => {
    const user = req.user!;
    log.debug("user with id", user.id, "is logging");
    const token = signJwt(user);
    log.debug("user with id is aquiring an access token");
    res.cookie("x-auth-cookie", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      signed: true,
    });
    res.status(200).json({ token, user });
  };
}
