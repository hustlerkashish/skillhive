import Layout from "../components/Layout";

export default function Privacy() {
  return (
    <Layout>
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Privacy Policy
            </h1>
            <p className="mt-5 text-xl text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <div className="mt-12 prose prose-blue prose-lg text-gray-500">
              <h2>1. Information We Collect</h2>
              <p>
                We collect information that you provide directly to us, including:
              </p>
              <ul>
                <li>Name and contact information</li>
                <li>Account credentials</li>
                <li>Profile information</li>
                <li>Course enrollment and progress data</li>
                <li>Payment information</li>
                <li>Communications with us</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide and maintain our services</li>
                <li>Process your transactions</li>
                <li>Send you technical notices and support messages</li>
                <li>Communicate with you about products, services, and events</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Detect, prevent, and address technical issues</li>
              </ul>

              <h2>3. Information Sharing</h2>
              <p>
                We do not sell or rent your personal information to third parties.
                We may share your information with:
              </p>
              <ul>
                <li>Service providers who assist in our operations</li>
                <li>Professional advisors</li>
                <li>Law enforcement when required by law</li>
              </ul>

              <h2>4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to
                protect your personal information against unauthorized access,
                alteration, disclosure, or destruction.
              </p>

              <h2>5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Data portability</li>
              </ul>

              <h2>6. Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to track activity
                on our service and hold certain information. You can instruct your
                browser to refuse all cookies or to indicate when a cookie is being
                sent.
              </p>

              <h2>7. Children's Privacy</h2>
              <p>
                Our service does not address anyone under the age of 13. We do not
                knowingly collect personally identifiable information from children
                under 13.
              </p>

              <h2>8. Changes to This Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify
                you of any changes by posting the new Privacy Policy on this page
                and updating the "Last updated" date.
              </p>

              <h2>9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact
                us at:
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