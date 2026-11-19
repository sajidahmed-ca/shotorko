export type SampleCase = {
  label: string;
  expected: "scam" | "legit";
  text: string;
};

export const SAMPLE_CASES: SampleCase[] = [
  {
    label: "KYC + OTP + bit.ly scam",
    expected: "scam",
    text: "URGENT: Your account will be suspended within 24 hours due to pending KYC. Verify now at http://bit.ly/fake-check and share your OTP code.",
  },
  {
    label: "Wrong transfer refund scam",
    expected: "scam",
    text: "Sorry I sent money by mistake to your number, please send it back right now.",
  },
  {
    label: "Easy daily income task scam",
    expected: "scam",
    text: "Work from home and earn 3000 daily with simple task commission. Join t.me/fast_income_bot",
  },
  {
    label: "Legitimate OTP notification (not asking you to share)",
    expected: "legit",
    text: "Your verification code is 849201. If you did not request this, ignore this message.",
  },
  {
    label: "Legitimate courier/order update",
    expected: "legit",
    text: "Your order #4029 has been packed and will arrive between 2 PM and 5 PM tomorrow.",
  },
  {
    label: "Legitimate meeting reminder",
    expected: "legit",
    text: "Reminder: Project review meeting starts at 11:00 AM on Friday in Room 3B.",
  },
];