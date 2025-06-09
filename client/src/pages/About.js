import Layout from "../components/Layout";

export default function About() {
  return (
    <Layout>
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              About SkillHive
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              Empowering learners through peer-led education
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                <p className="mt-4 text-lg text-gray-500">
                  SkillHive is dedicated to revolutionizing education by creating a
                  platform where knowledge sharing is accessible, engaging, and
                  community-driven. We believe in the power of peer learning and
                  the value of practical, real-world knowledge.
                </p>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
                <p className="mt-4 text-lg text-gray-500">
                  We envision a world where anyone can share their expertise and
                  learn from others in a structured, supportive environment. By
                  connecting learners and instructors, we're building a community
                  that values continuous learning and skill development.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Why Choose SkillHive?
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">
                  Peer-Led Learning
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Learn from experienced peers who understand your learning journey
                  and can provide practical insights.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">
                  Flexible Learning
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Access courses at your own pace, with bite-sized content designed
                  for busy professionals and students.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">
                  Community Driven
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Join a vibrant community of learners and instructors, share
                  experiences, and grow together.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Our Team
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <img
                  className="mx-auto h-40 w-40 rounded-full"
                  src="/team/member1.jpg"
                  alt="Team member"
                />
                <h3 className="mt-6 text-xl font-medium text-gray-900">
                  John Doe
                </h3>
                <p className="text-base text-gray-500">Founder & CEO</p>
              </div>

              <div className="text-center">
                <img
                  className="mx-auto h-40 w-40 rounded-full"
                  src="/team/member2.jpg"
                  alt="Team member"
                />
                <h3 className="mt-6 text-xl font-medium text-gray-900">
                  Jane Smith
                </h3>
                <p className="text-base text-gray-500">Head of Education</p>
              </div>

              <div className="text-center">
                <img
                  className="mx-auto h-40 w-40 rounded-full"
                  src="/team/member3.jpg"
                  alt="Team member"
                />
                <h3 className="mt-6 text-xl font-medium text-gray-900">
                  Mike Johnson
                </h3>
                <p className="text-base text-gray-500">Technical Lead</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 