import Layout from "../components/Layout";

export default function Terms() {
  return (
    <Layout>
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Terms of Service
            </h1>
            <p className="mt-5 text-xl text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <div className="mt-12 prose prose-blue prose-lg text-gray-500">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using SkillHive, you accept and agree to be bound
                by the terms and provision of this agreement.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                SkillHive is a peer learning platform that allows users to create,
                share, and enroll in courses. The service includes:
              </p>
              <ul>
                <li>Course creation and management</li>
                <li>Course enrollment and learning</li>
                <li>Progress tracking</li>
                <li>Discussion forums</li>
                <li>Review and rating system</li>
              </ul>

              <h2>3. User Accounts</h2>
              <p>To use our service, you must:</p>
              <ul>
                <li>Be at least 13 years old</li>
                <li>Register for an account</li>
                <li>Provide accurate information</li>
                <li>Maintain the security of your account</li>
                <li>Notify us of any unauthorized use</li>
              </ul>

              <h2>4. User Conduct</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Post harmful or malicious content</li>
                <li>Harass or abuse other users</li>
                <li>Attempt to gain unauthorized access</li>
                <li>Interfere with the service's operation</li>
              </ul>

              <h2>5. Course Content</h2>
              <p>
                As an instructor, you retain ownership of your course content but
                grant us a license to:
              </p>
              <ul>
                <li>Host and display your content</li>
                <li>Promote your courses</li>
                <li>Adapt content for accessibility</li>
                <li>Use content for platform improvement</li>
              </ul>

              <h2>6. Payments and Refunds</h2>
              <p>
                Course prices are set by instructors. We handle payments and
                distribute revenue according to our payment terms. Refund policies
                are determined by individual instructors.
              </p>

              <h2>7. Intellectual Property</h2>
              <p>
                The SkillHive platform, including its original content, features,
                and functionality, is owned by us and is protected by
                international copyright, trademark, and other intellectual property
                laws.
              </p>

              <h2>8. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the service
                at our sole discretion, without notice, for conduct that we
                believe violates these Terms of Service or is harmful to other
                users, us, or third parties, or for any other reason.
              </p>

              <h2>9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, SkillHive shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages resulting from your use of or inability to use
                the service.
              </p>

              <h2>10. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will
                notify users of any material changes by posting the new Terms of
                Service on this page.
              </p>

              <h2>11. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please
                contact us at:
              </p>
              <ul>
                <li>Email: support@agevole.in</li>
                <li>Phone: +91 75675 83505</li>
                <li>
                  Address: 409, Western Business Park, Udhana - Magdalla Road,
                  Surat, Gujarat, 395007
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 