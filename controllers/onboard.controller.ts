import { Request, Response } from "express";
import { SeekerOnboardingInput } from "../utils/validation/schema.validation";
import { onboardingService } from "../services/onboard.service";

export async function seekerOnboarding(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        message: "Unauthorized",
      });

      return;
    }

    const data = req.body as SeekerOnboardingInput;

    const updatedUser = await onboardingService.updateSeekerOnboarding(
      userId,
      data,
    );

    res.status(200).json({
      message: "Onboarding completed",
      userData: updatedUser,
    });

    return;
  } catch (error) {
    res.status(500).json({
      message: "Failed to complete onboarding",
    });

    return;
  }
}
