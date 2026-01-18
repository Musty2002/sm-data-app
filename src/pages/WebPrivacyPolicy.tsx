import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock, Eye, Database, Bell, Users, Trash2, Mail } from 'lucide-react';
import logo from '@/assets/logo.jpeg';

export default function WebPrivacyPolicy() {
  const navigate = useNavigate();
  const lastUpdated = "January 18, 2025";
  const appName = "SM Data App";
  const companyName = "SM Data App";
  const contactEmail = "support@smdataapp.com.ng";
  const websiteUrl = "https://smdataapp.com.ng";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="SM Data Logo" className="w-10 h-10 rounded-xl" />
            <span className="font-bold text-xl text-foreground">SM Data</span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/website')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last Updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          
          {/* Introduction */}
          <section className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Introduction
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to {appName} ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services (collectively, the "Service").
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              By using {appName}, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our Service.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Information We Collect
            </h2>
            
            <h3 className="font-medium text-foreground mt-4 mb-2">Personal Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              When you register for an account, we collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Profile picture (optional)</li>
            </ul>

            <h3 className="font-medium text-foreground mt-6 mb-2">Transaction Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              When you use our services, we collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Transaction history (airtime, data, bills payments)</li>
              <li>Wallet balance and transaction amounts</li>
              <li>Beneficiary phone numbers for service delivery</li>
              <li>Payment references and receipts</li>
            </ul>

            <h3 className="font-medium text-foreground mt-6 mb-2">Device Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              We automatically collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Device type and model</li>
              <li>Operating system version</li>
              <li>Unique device identifiers</li>
              <li>Push notification tokens (for sending notifications)</li>
              <li>App version</li>
            </ul>

            <h3 className="font-medium text-foreground mt-6 mb-2">Biometric Data</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you enable biometric authentication (fingerprint or face recognition), we use your device's biometric capabilities. <strong>We do not store your biometric data</strong> – authentication is handled entirely by your device's secure enclave.
            </p>
          </section>

          {/* How We Use Your Information */}
          <section className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li><strong>Provide Services:</strong> Process your transactions for airtime, data bundles, electricity bills, TV subscriptions, and exam pins</li>
              <li><strong>Account Management:</strong> Create and manage your user account, verify your identity, and maintain account security</li>
              <li><strong>Transaction Processing:</strong> Credit your wallet, process payments, and deliver services to beneficiary numbers</li>
              <li><strong>Communication:</strong> Send transaction confirmations, receipts, and important service updates</li>
              <li><strong>Push Notifications:</strong> Notify you about deposits, successful transactions, promotions, and account activities</li>
              <li><strong>Customer Support:</strong> Respond to your inquiries and resolve issues</li>
              <li><strong>Referral Program:</strong> Track referrals and distribute referral bonuses</li>
              <li><strong>Cashback Rewards:</strong> Calculate and credit cashback earnings to your account</li>
              <li><strong>Security:</strong> Detect and prevent fraud, unauthorized access, and other illegal activities</li>
              <li><strong>Improvement:</strong> Analyze usage patterns to improve our services and user experience</li>
            </ul>
          </section>

          {/* Data Sharing and Disclosure */}
          <section className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Data Sharing and Disclosure
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li><strong>Service Providers:</strong> We work with trusted third-party partners (network providers, payment processors, bill payment aggregators) to deliver our services. They only receive information necessary to perform their functions.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law, court order, or government regulation.</li>
              <li><strong>Safety and Security:</strong> We may share information to protect the rights, property, or safety of {appName}, our users, or others.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of the transaction.</li>
            </ul>
          </section>

          {/* Push Notifications */}
          <section className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Push Notifications
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use push notifications to keep you informed about:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Wallet deposits and credits</li>
              <li>Transaction confirmations</li>
              <li>Promotional offers and new features</li>
              <li>Important account updates</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can manage or disable push notifications at any time through your device settings or within the app's notification preferences.
            </p>
          </section>

          {/* Data Security */}
          <section className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Data Security
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement robust security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li><strong>Encryption:</strong> All data transmitted between the app and our servers is encrypted using industry-standard TLS/SSL protocols</li>
              <li><strong>Secure Storage:</strong> Personal data is stored in secure, encrypted databases with restricted access</li>
              <li><strong>Transaction PIN:</strong> Additional layer of security requiring a 4-digit PIN for all transactions</li>
              <li><strong>Biometric Authentication:</strong> Optional fingerprint or face recognition for quick and secure access</li>
              <li><strong>Session Management:</strong> Automatic session timeout and secure login mechanisms</li>
              <li><strong>Access Controls:</strong> Strict internal access controls limit employee access to user data</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              While we strive to protect your information, no method of transmission over the internet is 100% secure. We encourage you to use strong passwords and keep your login credentials confidential.
            </p>
          </section>

          {/* Data Retention */}
          <section className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Data Retention
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide you services. We also retain and use your information as necessary to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Comply with legal obligations</li>
              <li>Resolve disputes</li>
              <li>Enforce our agreements</li>
              <li>Maintain transaction records as required by financial regulations</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Transaction records are typically retained for a minimum of 7 years in accordance with financial record-keeping requirements.
            </p>
          </section>

          {/* Your Rights */}
          <section className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Your Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Update or correct inaccurate personal information through your profile settings</li>
              <li><strong>Deletion:</strong> Request deletion of your account and personal data (subject to legal retention requirements)</li>
              <li><strong>Portability:</strong> Request your data in a commonly used, machine-readable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from promotional communications and disable push notifications</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing where applicable</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise any of these rights, please contact us at <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a>.
            </p>
          </section>

          {/* Account Deletion */}
          <section className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-primary" />
              Account Deletion
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You may request to delete your account at any time by:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Contacting our support team at <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a></li>
              <li>Using the account deletion option in the app settings (if available)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Upon account deletion:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Your profile information will be permanently deleted</li>
              <li>Active wallet balance must be withdrawn before deletion</li>
              <li>Transaction history may be retained for legal compliance purposes</li>
              <li>The deletion process is typically completed within 30 days</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service is not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a>. We will take steps to delete such information from our systems.
            </p>
          </section>

          {/* Third-Party Services */}
          <section className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our app may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read the privacy policies of any third-party services you access through our app.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Firebase Cloud Messaging (for push notifications)</li>
              <li>Payment processing partners (for wallet funding)</li>
              <li>Network service providers (for airtime and data delivery)</li>
            </ul>
          </section>

          {/* Changes to This Policy */}
          <section className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last Updated" date at the top of this policy</li>
              <li>Sending a push notification for significant changes</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We encourage you to review this Privacy Policy periodically for any changes. Your continued use of the Service after any modifications indicates your acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Us */}
          <section className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-4 space-y-2 text-muted-foreground">
              <p><strong>Company:</strong> {companyName}</p>
              <p><strong>Email:</strong> <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a></p>
              <p><strong>Website:</strong> <a href={websiteUrl} className="text-primary hover:underline">{websiteUrl}</a></p>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We will respond to your inquiry within 30 business days.
            </p>
          </section>

          {/* Consent */}
          <section className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Consent</h2>
            <p className="text-muted-foreground leading-relaxed">
              By using {appName}, you consent to this Privacy Policy and agree to its terms. If you do not agree to this policy, please do not use our Service.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={logo} alt="SM Data Logo" className="w-8 h-8 rounded-lg" />
            <span className="font-semibold text-foreground">SM Data App</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SM Data App. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <button onClick={() => navigate('/website')} className="text-muted-foreground hover:text-primary">Home</button>
            <button onClick={() => navigate('/website/about')} className="text-muted-foreground hover:text-primary">About</button>
            <button onClick={() => navigate('/website/contact')} className="text-muted-foreground hover:text-primary">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
