export type PresetSample = {
  id: string;
  buttonLabel: string;
  kind: "scam" | "legit";
  text: string;
};

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: "kyc-otp-link",
    buttonLabel: "Scam: KYC & OTP",
    kind: "scam",
    text: "URGENT: Your account will be suspended within 24 hours due to pending KYC. Verify now at http://bit.ly/fake-check and share your OTP code.",
  },
  {
    id: "wrong-transfer",
    buttonLabel: "Scam: Wrong Transfer",
    kind: "scam",
    text: "Sorry I sent money by mistake to your number, please send it back right now.",
  },
  {
    id: "task-job",
    buttonLabel: "Scam: Task Job",
    kind: "scam",
    text: "Work from home and earn 3000 daily with simple task commission. Join t.me/fast_income_bot",
  },
  {
    id: "legit-otp",
    buttonLabel: "Safe: OTP Notice",
    kind: "legit",
    text: "Your verification code is 849201. If you did not request this, ignore this message.",
  },
  {
    id: "legit-delivery",
    buttonLabel: "Safe: Order Update",
    kind: "legit",
    text: "Your order #4029 has been packed and will arrive between 2 PM and 5 PM tomorrow.",
  },
];