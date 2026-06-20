import type { AnalysisInput, ImpactAnalysis } from '@/types/analysis'

const TESTRAIL_BASE = 'https://testrail.csod.com/index.php?/cases/view'
const GALAXY_REPO = 'galaxy-automation'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function analyzeChange(input: AnalysisInput): Promise<ImpactAnalysis> {
  await delay(1500)

  const jiraRef = input.inputValue.trim() || 'GALXY-1234'

  return {
    id: crypto.randomUUID(),
    inputType: input.inputType,
    inputValue: jiraRef,
    changeSummary: {
      title: 'Admin Theme & Branding — custom header logo and profile banner',
      description:
        'Enhance portal theme and branding configuration to support custom header logos, profile banner uploads, and theme creation workflows in Galaxy Admin.',
      modules: ['admin', 'portal', 'theme_and_branding'],
      businessCapability: 'Portal configuration and white-label branding',
      functionalAreas: [
        'Theme and branding admin pages',
        'Profile banner upload and validation',
        'Header logo configuration',
        'Theme create/edit flows',
      ],
    },
    codeImpact: {
      files: [
        'AdminThemePage.java',
        'AdminBrandingPage.java',
        'CreateThemePage.java',
        'EditThemePage.java',
        'GalaxyHeaderMenuPage.java',
      ],
      services: ['GalaxyWebService', 'AdminPortalService'],
      components: [
        'AdminBrandingPage',
        'AdminThemePage',
        'CreateThemePage',
        'GalaxyHeaderMenuPage',
        'ProfilePage',
      ],
    },
    testRail: {
      projectId: '49',
      suiteName: 'Picasso Admin Regression',
      testCases: [
        {
          id: 'C29925265',
          title: 'Verify the Theme and Branding page loads',
          suite: 'Admin Theme & Branding',
          url: `${TESTRAIL_BASE}/29925265`,
        },
        {
          id: 'C29906501',
          title: 'Verify profile banner image can be uploaded',
          suite: 'Admin Theme & Branding',
          url: `${TESTRAIL_BASE}/29906501`,
        },
        {
          id: 'C29906503',
          title: 'Verify uploaded profile banner reflects on user profile',
          suite: 'Admin Theme & Branding',
          url: `${TESTRAIL_BASE}/29906503`,
        },
        {
          id: 'C29906508',
          title: 'Verify header logo can be configured',
          suite: 'Admin Theme & Branding',
          url: `${TESTRAIL_BASE}/29906508`,
        },
        {
          id: 'C29906512',
          title: 'Verify custom theme can be created',
          suite: 'Admin Theme & Branding',
          url: `${TESTRAIL_BASE}/29906512`,
        },
      ],
    },
    automation: {
      repo: GALAXY_REPO,
      framework: 'Java Playwright + TestNG + Allure',
      testNgSuite: 'src/test/resources/testng_suites/Admin_Sanity_Test_Suite.xml',
      tests: [
        {
          file: 'src/test/java/com/qa/galaxy/admin/AdminThemeAndBrandingTest.java',
          testClass: 'AdminThemeAndBrandingTest',
          testMethods: [
            'testVerifyThemeAndBrandingPageLoads',
            'testVerifyUploadBannerImage',
            'testVerifyHeaderLogoConfiguration',
            'testVerifyCreateCustomTheme',
          ],
          groups: ['Sanity', 'Smoke', 'Admin', 'Regression'],
          testRailIds: ['29925265', '29906501', '29906503', '29906508', '29906512'],
        },
        {
          file: 'src/main/java/com/qa/galaxy/pages/admin/portal/portal_configuration/theme_and_branding/AdminBrandingPage.java',
          testClass: 'AdminBrandingPage',
          testMethods: ['Page object — profile banner & branding locators'],
          groups: ['Page Object'],
          testRailIds: ['29906501', '29906503'],
        },
        {
          file: 'src/main/java/com/qa/galaxy/pages/admin/portal/portal_configuration/theme_and_branding/AdminThemePage.java',
          testClass: 'AdminThemePage',
          testMethods: ['Page object — theme configuration locators'],
          groups: ['Page Object'],
          testRailIds: ['29925265', '29906512'],
        },
      ],
    },
    coverageGaps: {
      missingScenarios: [
        'Theme revert after failed banner upload',
        'Header logo validation for unsupported file formats',
        'Theme preview across mobile and desktop breakpoints',
      ],
      missingAutomation: [
        'Automated visual regression for profile banner after theme switch',
        'Negative test for oversized header logo upload',
      ],
      edgeCases: [
        'Concurrent admin edits to theme and branding settings',
        'Profile banner cache invalidation after branding update',
      ],
    },
    risk: {
      score: 74,
      level: 'HIGH',
      factors: [
        '3 modules impacted (admin, portal, theme_and_branding)',
        '5 page objects and 1 test class affected',
        '2 missing automation areas in galaxy-automation',
        'Admin Sanity suite must pass before release',
      ],
    },
    recommendations: [
      'Run Admin_Sanity_Test_Suite.xml on PRESTAGE before merge',
      'Update AdminThemeAndBrandingTest.java for new header logo validation',
      'Add 2 new TestRail cases for theme preview breakpoints',
      'Review AdminBrandingPage.java locators after UI changes',
    ],
    actionPlan: {
      pr: {
        title: 'Update galaxy-automation for Theme & Branding changes',
        branchName: 'test/impactiq-theme-branding-coverage',
        description:
          'Create a PR in galaxy-automation updating AdminThemeAndBrandingTest and related page objects for the impacted TestRail cases.',
        changes: [
          {
            id: 'pr-1',
            testFile: 'AdminThemeAndBrandingTest.java',
            changeType: 'update',
            summary:
              'Update banner upload and header logo tests for new admin UI locators',
            relatedCases: ['C29906501', 'C29906503', 'C29906508'],
            suggestedDiff:
              '@Test(groups = {"Regression", "Admin"})\n' +
              '@TestRailCases(testCasesId = "29906508")\n' +
              'public void testVerifyHeaderLogoConfiguration() {\n' +
              '    // update locators after AdminBrandingPage refactor\n' +
              '}',
          },
          {
            id: 'pr-2',
            testFile: 'AdminBrandingPage.java',
            changeType: 'update',
            summary: 'Fix profile banner and header logo locators',
            relatedCases: ['C29906501', 'C29906503'],
            suggestedDiff:
              'private Locator profileBannerUploadInput = page.locator("[data-testid=profile-banner-upload]");\n' +
              'private Locator headerLogoSaveButton = page.locator("[data-testid=header-logo-save]");',
          },
          {
            id: 'pr-3',
            testFile: 'AdminThemePage.java',
            changeType: 'update',
            summary: 'Update theme page load checks and navigation helpers',
            relatedCases: ['C29925265', 'C29906512'],
            suggestedDiff:
              'public boolean isPageLoaded() {\n' +
              '    return themeHeading.isVisible() && brandingTab.isVisible();\n' +
              '}',
          },
          {
            id: 'pr-4',
            testFile: 'CreateThemePage.java',
            changeType: 'create',
            summary: 'Add page object for new custom theme creation flow',
            relatedCases: ['C29906512'],
            suggestedDiff:
              'public class CreateThemePage extends BasePage {\n' +
              '    public CreateThemePage enterThemeName(String name) { ... }\n' +
              '    public AdminThemePage clickSaveTheme() { ... }\n' +
              '}',
          },
        ],
        prBody: `## ImpactIQ — galaxy-automation coverage PR

### Jira
${jiraRef}

### Context
Admin Theme & Branding changes impact portal configuration, profile banner uploads, and header logo settings.

### Repository
\`${GALAXY_REPO}\`

### Changes
- Update \`AdminThemeAndBrandingTest.java\` — header logo + banner tests
- Update \`AdminBrandingPage.java\` — profile banner & header logo locators
- Update \`AdminThemePage.java\` — page load and navigation
- Add \`CreateThemePage.java\` — custom theme creation flow

### TestRail cases
C29925265, C29906501, C29906503, C29906508, C29906512

### Verify
\`\`\`bash
mvn test -DsuiteXmlFile=src/test/resources/testng_suites/Admin_Sanity_Test_Suite.xml
\`\`\``,
      },
      cursor: [
        {
          id: 'cursor-1',
          category: 'code',
          title: 'Update AdminThemeAndBrandingTest.java',
          description:
            'Use Cursor Agent to update Java Playwright tests mapped to TestRail cases 29906501, 29906508.',
          mcpTools: ['filesystem', 'jetbrains', 'terminal'],
          targetFiles: [
            'src/test/java/com/qa/galaxy/admin/AdminThemeAndBrandingTest.java',
            'src/main/java/com/qa/galaxy/pages/admin/portal/portal_configuration/theme_and_branding/AdminBrandingPage.java',
          ],
          status: 'ready',
          cursorPrompt: `In galaxy-automation repo, update AdminThemeAndBrandingTest.java for Theme & Branding changes:
1. Fix testVerifyUploadBannerImage for new profile banner locators (TestRail C29906501, C29906503)
2. Add/update testVerifyHeaderLogoConfiguration (TestRail C29906508)
3. Update AdminBrandingPage.java locators to match current admin UI
4. Follow existing @TestRailCases and @Test(groups = {"Sanity","Admin"}) patterns`,
        },
        {
          id: 'cursor-2',
          category: 'run',
          title: 'Run Admin Sanity suite via Maven',
          description:
            'Execute impacted Admin tests through Cursor terminal against PRESTAGE environment.',
          mcpTools: ['terminal', 'jetbrains'],
          targetFiles: [
            'src/test/resources/testng_suites/Admin_Sanity_Test_Suite.xml',
          ],
          status: 'pending',
          cursorPrompt: `In galaxy-automation, run Admin Theme & Branding tests:
mvn test -DsuiteXmlFile=src/test/resources/testng_suites/Admin_Sanity_Test_Suite.xml -Dtest=AdminThemeAndBrandingTest

Environment: PRESTAGE (config.properties)
If tests fail, inspect Allure results in target/allure-results and fix locators.`,
        },
        {
          id: 'cursor-3',
          category: 'playwright',
          title: 'Fix AdminBrandingPage locators after UI change',
          description:
            'Cursor inspects failing Playwright Java tests and patches page object selectors.',
          mcpTools: ['filesystem', 'terminal', 'jetbrains'],
          targetFiles: [
            'src/main/java/com/qa/galaxy/pages/admin/portal/portal_configuration/theme_and_branding/AdminBrandingPage.java',
            'src/main/java/com/qa/galaxy/pages/admin/portal/portal_configuration/theme_and_branding/AdminThemePage.java',
          ],
          status: 'pending',
          cursorPrompt: `AdminThemeAndBrandingTest is failing due to stale locators in AdminBrandingPage.java.
1. Run testVerifyThemeAndBrandingPageLoads
2. Update locators in AdminBrandingPage and AdminThemePage
3. Re-run AdminThemeAndBrandingTest until green`,
        },
      ],
      testRail: [
        {
          id: 'tr-action-1',
          action: 'create',
          title: 'Theme preview across mobile and desktop breakpoints',
          suite: 'Admin Theme & Branding',
          steps: [
            'Navigate to Admin > Theme and Branding',
            'Create or select a custom theme',
            'Open theme preview on desktop viewport',
            'Switch to mobile viewport and verify layout',
            'Confirm header logo and profile banner render correctly',
          ],
          status: 'ready',
          cursorPrompt: `Using TestRail MCP (project 49), create a new test case:
Title: Theme preview across mobile and desktop breakpoints
Suite: Admin Theme & Branding
Link to Jira ${jiraRef}. Priority: High.
Add @TestRailCases mapping in AdminThemeAndBrandingTest.java after creation.`,
        },
        {
          id: 'tr-action-2',
          action: 'create',
          title: 'Reject unsupported header logo file format',
          suite: 'Admin Theme & Branding',
          steps: [
            'Go to Admin Theme and Branding > Header logo',
            'Upload unsupported file type (e.g. .pdf)',
            'Verify validation error is displayed',
            'Confirm previous logo remains unchanged',
          ],
          status: 'ready',
          cursorPrompt: `Create TestRail case in project 49:
Title: Reject unsupported header logo file format
Suite: Admin Theme & Branding. Type: Regression.`,
        },
        {
          id: 'tr-action-3',
          action: 'update',
          caseId: 'C29925265',
          title: 'Verify the Theme and Branding page loads',
          suite: 'Admin Theme & Branding',
          steps: [
            'Login as Galaxy admin user',
            'Navigate to Admin > Theme and Branding',
            'Verify theme tab and branding tab are visible',
            'Add precondition for new header logo section',
          ],
          status: 'pending',
          cursorPrompt: `Update TestRail case C29925265 (https://testrail.csod.com/index.php?/cases/view/29925265):
Add steps for new header logo configuration section.
Ensure AdminThemeAndBrandingTest.testVerifyThemeAndBrandingPageLoads still maps to this case.`,
        },
      ],
    },
  }
}
