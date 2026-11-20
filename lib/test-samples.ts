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
  // ---- Bangla ----
  {
    label: "Bangla: account block + KYC + OTP",
    expected: "scam",
    text: "প্রিয় গ্রাহক, আপনার বিকাশ অ্যাকাউন্ট বন্ধ হয়ে যাবে। এখনই KYC আপডেট করুন এবং ওটিপি দিন।",
  },
  {
    label: "Bangla: wrong number refund",
    expected: "scam",
    text: "ভাই ভুল নম্বরে ৫০০০ টাকা চলে গেছে, প্লিজ ফেরত দিন।",
  },
  {
    label: "Bangla: lottery + fee",
    expected: "scam",
    text: "অভিনন্দন! আপনি ৫ লক্ষ টাকার লটারি জিতেছেন। বোনাস দাবি করতে রেজিস্ট্রেশন ফি পাঠান।",
  },
  {
    label: "Bangla: work from home income",
    expected: "scam",
    text: "ঘরে বসে প্রতিদিন ৩০০০ টাকা আয় করুন। পার্টটাইম জব, কোনো অভিজ্ঞতা লাগবে না।",
  },
  {
    label: "Bangla: NID request",
    expected: "scam",
    text: "আপনার সিম বন্ধ হবে। এনআইডি নম্বর পাঠান এবং পিন বলুন।",
  },
  {
    label: "Bangla legit: OTP with warning",
    expected: "legit",
    text: "আপনার ওটিপি 849201। এটি কাউকে শেয়ার করবেন না।",
  },
  {
    label: "Bangla legit: cash in",
    expected: "legit",
    text: "আপনার অ্যাকাউন্টে ৫০০ টাকা ক্যাশ ইন হয়েছে। ট্রানজেকশন আইডি ABC123।",
  },
  {
    label: "Bangla legit: order update",
    expected: "legit",
    text: "আপনার অর্ডারটি আগামীকাল দুপুর ২টা থেকে ৫টার মধ্যে পৌঁছাবে।",
  },
  // ---- Banglish ----
  {
    label: "Banglish: account block + KYC + OTP",
    expected: "scam",
    text: "apnar bkash account bondho hoye jabe, ekhoni KYC update korun ar OTP din",
  },
  {
    label: "Banglish: wrong number refund",
    expected: "scam",
    text: "vul number e 5000 taka chole gese, taka ferot din plz",
  },
  {
    label: "Banglish: work from home",
    expected: "scam",
    text: "ghore bose income korun, daily 3000 taka income. t.me/earnfast",
  },
  {
    label: "Banglish legit: order update",
    expected: "legit",
    text: "apnar order ta kal bikel e pouchabe",
  },
  // ---- English warnings must not be flagged ----
  {
    label: "English legit: OTP with warning",
    expected: "legit",
    text: "Your OTP is 123456. Never share your OTP with anyone, including bank staff.",
  },
];
