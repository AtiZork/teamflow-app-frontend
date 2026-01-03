import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header';
import "../styles/HelpSupport.css";

const HelpSupport = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqItems = [
    {
      id: 1,
      question: "How do I create a new project?",
      answer: "To create a new project, navigate to the Projects page and click the 'Create Project' button. Fill in the required details like project name, description, and team members, then save your project."
    },
    {
      id: 2,
      question: "Can I assign tasks to multiple team members?",
      answer: "Yes, you can assign tasks to multiple team members. When creating or editing a task, use the assignee field to select one or more team members from your project team."
    },
    {
      id: 3,
      question: "How do I track project progress?",
      answer: "Project progress can be tracked through the dashboard which shows completion percentages, task statuses, and team performance metrics. You can also generate progress reports from the analytics section."
    },
    {
      id: 4,
      question: "Is there a mobile app available?",
      answer: "Yes, our task management app is available on both iOS and Android platforms. You can download it from the respective app stores and sync your projects across all devices."
    },
    {
      id: 5,
      question: "How do I integrate with other tools?",
      answer: "We offer integrations with popular tools like Slack, Google Calendar, and GitHub. Go to Settings > Integrations to connect your accounts and enable seamless workflow."
    }
  ];

  const toggleFaq = (id) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  return (
    <Layout>
      <div className="help-support-page">
        <Header
          title="Help & Support"
          subtitle="Get help, find answers, and learn how to make the most of our task management platform."
        />

        <div className="help-support-content">
          {/* Three Horizontal Blocks Container */}
          <div className="horizontal-blocks-container">
            {/* Block 1: FAQ Section */}
            <div className="content-block faq-block">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Frequently Asked Questions</h2>
                  <p className="card-description">Find quick answers to common questions</p>
                </div>
                <div className="faq-list">
                  {faqItems.map((faq) => (
                    <div key={faq.id} className={`faq-item ${activeFaq === faq.id ? 'active' : ''}`}>
                      <div
                        className="faq-question"
                        onClick={() => toggleFaq(faq.id)}
                      >
                        <span className="faq-text">{faq.question}</span>
                        <span className="faq-icon">
                          {activeFaq === faq.id ? '−' : '+'}
                        </span>
                      </div>
                      {activeFaq === faq.id && (
                        <div className="faq-answer">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Block 2: Contact Support */}
            <div className="content-block contact-block">
              <div className="card support-info">
                <div className="card-header">
                  <h2 className="card-title">Contact Support</h2>
                  <p className="card-description">Get in touch with our support team</p>
                </div>
                <div className="support-channels">
                  <div className="support-channel">
                    <div className="channel-icon">📧</div>
                    <div className="channel-info">
                      <h4>Email Support</h4>
                      <p>support@taskmanager.com</p>
                      <span className="channel-note">Typically responds within 24 hours</span>
                    </div>
                  </div>
                  <div className="support-channel">
                    <div className="channel-icon">💬</div>
                    <div className="channel-info">
                      <h4>Live Chat</h4>
                      <p>Available 9AM-6PM EST</p>
                      <span className="channel-note">Click the chat icon in the bottom right</span>
                    </div>
                  </div>
                  <div className="support-channel">
                    <div className="channel-icon">📞</div>
                    <div className="channel-info">
                      <h4>Phone Support</h4>
                      <p>+1 (555) 123-4567</p>
                      <span className="channel-note">Mon-Fri, 8AM-8PM EST</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Block 3: Resources & Hours */}
            <div className="content-block resources-block">
              <div className="card support-hours">
                <div className="card-header">
                  <h2 className="card-title">Resources & Support Hours</h2>
                  <p className="card-description">Additional help resources and availability</p>
                </div>

                <div className="resources-list">
                  <div className="resource-item">
                    <div className="resource-icon">📚</div>
                    <div className="resource-info">
                      <h4>Knowledge Base</h4>
                      <p>help.taskmanager.com</p>
                    </div>
                  </div>
                  <div className="resource-item">
                    <div className="resource-icon">👥</div>
                    <div className="resource-info">
                      <h4>Community Forum</h4>
                      <p>community.taskmanager.com</p>
                    </div>
                  </div>
                  <div className="resource-item">
                    <div className="resource-icon">🔧</div>
                    <div className="resource-info">
                      <h4>API Documentation</h4>
                      <p>api.taskmanager.com</p>
                    </div>
                  </div>
                </div>

                <div className="hours-section">
                  <h3 className="hours-title">Support Hours</h3>
                  <div className="hours-list">
                    <div className="hours-item">
                      <span className="hours-day">Monday - Friday</span>
                      <span className="hours-time">8:00 AM - 8:00 PM EST</span>
                    </div>
                    <div className="hours-item">
                      <span className="hours-day">Saturday</span>
                      <span className="hours-time">9:00 AM - 6:00 PM EST</span>
                    </div>
                    <div className="hours-item">
                      <span className="hours-day">Sunday</span>
                      <span className="hours-time">10:00 AM - 4:00 PM EST</span>
                    </div>
                  </div>
                  <div className="hours-note">
                    <p>Emergency support available 24/7 for critical issues affecting multiple users.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HelpSupport;