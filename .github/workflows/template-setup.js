// Template Setup Script - Configure repository from template
const fs = require('fs');
const { execSync } = require('child_process');

(async () => {
  try {
    // Get repository information from environment variables
    const owner = process.env.GITHUB_REPOSITORY_OWNER;
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
    const repoUrl = `https://github.com/${owner}/${repo}`;
    
    console.log(`Setting up repository: ${owner}/${repo}`);
    
    // Check if this repository still has template references
    const readmeContent = fs.readFileSync('README.md', 'utf8');
    if (!readmeContent.includes('gittogethers/raffle')) {
      console.log('Repository already configured, skipping setup');
      return;
    }
    
    console.log('Repository needs configuration, proceeding with setup...');
    
    // Update README.md with correct repository information
    let updatedReadme = readmeContent
      .replace(/gittogethers\/raffle/g, `${owner}/${repo}`)
      .replace(/https:\/\/github\.com\/gittogethers\/raffle/g, repoUrl);
    
    // Remove template-specific sections from README.md
    // Remove the "Use this template" badge line
    updatedReadme = updatedReadme
      .replace(/\[\[Use this template\]\][^\n]*\n?/g, '')
      .replace(/\[!\[Use this template\]\][^\n]*\n?/g, '');
    
    // Remove Features section (from ## ✨ Features to next ## section)
    updatedReadme = updatedReadme.replace(/^## ✨ Features$[\s\S]*?(?=^## )/m, '');
    
    // Remove Quick Start section (from ## 🚀 Quick Start to next ## section)
    updatedReadme = updatedReadme.replace(/^## 🚀 Quick Start$[\s\S]*?(?=^## )/m, '');
    
    // Create improved quick action links
    const quickActions = `
## 🎯 Quick Actions

Ready to get started? Use these quick links:

- **[📝 Create New Raffle](${repoUrl}/issues/new?template=raffle-event.yml)** - Start a new raffle event for your community
- **[🏆 Select Winners](${repoUrl}/actions/workflows/winner-selection.yml)** - Run the automated winner selection process
- **[📊 View Past Raffles](${repoUrl}/issues?q=is%3Aissue+label%3Araffle)** - Browse completed raffle events

`;
    
    // Insert the quick actions before the License section
    updatedReadme = updatedReadme.replace(/^## 📄 License$/m, `${quickActions}## 📄 License`);
    
    // Write the updated README.md
    fs.writeFileSync('README.md', updatedReadme);
    
    console.log('README.md updated successfully');
    
    // Configure git
    execSync('git config --local user.email "action@github.com"', { stdio: 'inherit' });
    execSync('git config --local user.name "GitHub Action"', { stdio: 'inherit' });
    
    // Commit changes
    execSync('git add .', { stdio: 'inherit' });
    
    const commitMessage = `🔧 Auto-configure repository from template

- Updated repository references in README.md  
- Removed template-specific sections (Use Template badge, Features, Quick Start)
- Added Quick Actions section before License section
- Repository configured for: ${owner}/${repo}`;
    
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    
    console.log('Repository configuration completed successfully');
    
    // Remove the template setup workflow and script files
    console.log('Cleaning up template setup files...');
    
    try {
      fs.unlinkSync('.github/workflows/template-setup.yml');
      fs.unlinkSync('.github/workflows/template-setup.js');
      console.log('Template setup files removed');
    } catch (error) {
      console.log('Template setup files already removed or not found');
    }
    
    // Commit the cleanup
    execSync('git add .', { stdio: 'inherit' });
    
    try {
      execSync('git commit -m "🧹 Clean up template setup files"', { stdio: 'inherit' });
      execSync('git push', { stdio: 'inherit' });
      console.log('Template setup cleanup completed');
    } catch (error) {
      console.log('No changes to commit during cleanup');
    }
    
  } catch (error) {
    console.error('Error during template setup:', error.message);
    process.exit(1);
  }
})();
