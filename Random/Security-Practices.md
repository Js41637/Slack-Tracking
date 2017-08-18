# Security Practices

**Effective: December 1, 2015**

We take the security of your data very seriously at Slack. As transparency is one of the principles on which our company is built, we aim to be as clear and open as we can about the way we handle security.

If you have additional questions regarding security, we are happy to answer them. Please write to [feedback@slack.com](mailto:feedback@slack.com) and we will respond as quickly as we can.

## Confidentiality

We place strict controls over our employees’ access to the data you and your users make available via the Slack services, as more specifically defined in your agreement with Slack covering the use of the Slack services ("**Customer Data**"), and are committed to ensuring that Customer Data is not seen by anyone who should not have access to it. The operation of the Slack services requires that some employees have access to the systems which store and process Customer Data. For example, in order to diagnose a problem you are having with the Slack services, we may need to access your Customer Data. These employees are prohibited from using these permissions to view Customer Data unless it is necessary to do so. We have technical controls and audit policies in place to ensure that any access to Customer Data is logged.

All of our employees and contract personnel are bound to our policies regarding Customer Data and we treat these issues as matters of the highest importance within our company.

## Personnel Practices

Slack conducts background checks on all employees before employment, and employees receive security training during onboarding as well as on an ongoing basis. All employees are required to read and sign our comprehensive information security policy covering the security, availability, and confidentiality of the Slack services.

## Compliance

The following security-related audits and certifications are applicable to the Slack services:

*   **Service Organization Control (SOC) Reports**: Slack has undergone a SOC 2 audit, and a copy of Slack’s most recent report is available upon request from your Account Manager.
*   **PCI**: Slack is not currently a PCI-certified Service Provider. We are a PCI Level 4 Merchant and have completed the Payment Card Industry Data Security Standard’s SAQ-A, allowing us to use a third party to process your credit card information securely.

The environment that hosts the Slack services maintains multiple certifications for its data centers, including ISO 27001 compliance, PCI Certification, and SOC reports. For more information about their certification and compliance, please visit the [AWS Security website](https://aws.amazon.com/security/) and the [AWS Compliance website](https://aws.amazon.com/compliance/).

## Security Features for Team Members & Administrators

In addition to the work we do at the infrastructure level, we provide Team Administrators of paid versions of the Slack services with additional tools to enable their own users to protect their Customer Data.

### Access Logging

Detailed access logs are available both to users and administrators of paid teams. We log every time an account signs in, noting the type of device used and the IP address of the connection.

Team Administrators and owners of paid teams can review consolidated access logs for their whole team. We also make it easy for administrators to remotely terminate all connections and sign out all devices authenticated to the Slack services at any time, on-demand.

### Team-Wide Two-Factor Authentication

Team Administrators can require all users to set up two-factor authentication on their accounts. Instructions for doing this are available [on our Help Center](https://slack.zendesk.com/hc/en-us/articles/212221668-team-wide-two-factor-authentication).

### Single Sign On

Administrators of paid teams can integrate their Slack services instance with a variety of single-sign-on providers. Teams on the ‘Standard’ plan can enable Google Apps for Domains as their authentication provider, and teams on the ‘Plus’ plan can enable SAML SSO with providers such as OneLogin, Okta, Centrify, and Ping Identity.

### Data Retention

Owners of paid Slack teams can configure [custom message retention policies](https://get.slack.help/hc/en-us/articles/203457187-setting-up-custom-message-and-file-retention) on a team-wide and per-channel basis. Setting a custom duration for retention means that messages or files older than the duration you set will be deleted on a nightly basis.

### Deletion of Customer Data

Slack provides the option for Team Owners to delete Customer Data at any time during a subscription term. Within 24 hours of Team Owner initiated deletion, Slack hard deletes all information from currently-running production systems (excluding team and channel names, and search terms embedded in URLs in web server access logs). Slack services backups are destroyed within 14 days.

### Return of Customer Data

Information about the export capabilities of the Slack services can be found [at our Help Center](https://get.slack.help/hc/en-us/articles/204897248-guide-to-slack-data-exports).

## Data Encryption In Transit and At Rest

The Slack services support the latest recommended secure cipher suites and protocols to encrypt all traffic in transit. Customer Data is encrypted at rest.

We monitor the changing cryptographic landscape closely and work promptly to upgrade the service to respond to new cryptographic weaknesses as they are discovered and implement best practices as they evolve. For encryption in transit, we do this while also balancing the need for compatibility for older clients.

## Availability

We understand that you rely on the Slack services to work. We're committed to making Slack a highly-available service that you can count on. Our infrastructure runs on systems that are fault tolerant, for failures of individual servers or even entire data centers. Our operations team tests disaster-recovery measures regularly and staffs an around-the-clock on-call team to quickly resolve unexpected incidents.

## Disaster Recovery

Customer Data is stored redundantly at multiple locations in our hosting provider’s data centers to ensure availability. We have well-tested backup and restoration procedures, which allow recovery from a major disaster. Customer Data and our source code are automatically backed up nightly. The Operations team is alerted in case of a failure with this system. Backups are fully tested at least every 90 days to confirm that our processes and tools work as expected.

## Network Protection

In addition to sophisticated system monitoring and logging, we have implemented two-factor authentication for all server access across our production environment. Firewalls are configured according to industry best practices and unnecessary ports are blocked by configuration with AWS Security Groups.

## Host Management

We perform automated vulnerability scans on our production hosts and remediate any findings that present a risk to our environment. We enforce screens lockouts and the usage of full disk encryption for company laptops.

## Logging

Slack maintains an extensive, centralized logging environment in its production environment which contains information pertaining to security, monitoring, availability, access, and other metrics about the Slack services. These logs are analyzed for security events via automated monitoring software, overseen by the security team.

## Incident Management & Response

In the event of a security breach, Slack will promptly notify you of any unauthorized access to your Customer Data. Slack has incident management policies and procedures in place to handle such an event.

## External Security Audits

We contract with respected external security firms who perform regular audits of the Slack services to verify that our security practices are sound and to monitor the Slack services for new vulnerabilities discovered by the security research community. In addition to periodic and targeted audits of the Slack services and features, we also employ the use of continuous hybrid automated scanning of our web platform.

## Product Security Practices

New features, functionality, and design changes go through a security review process facilitated by the security team. In addition, our code is audited with automated static analysis software, tested, and manually peer-reviewed prior to being deployed to production. The security team works closely with development teams to resolve any additional security concerns that may arise during development.

Slack also operates a security bug bounty program. Security researchers around the world continuously test the security of the Slack services, and report issues via the program. More details of this program are available [at the bounty site](https://hackerone.com/slack).