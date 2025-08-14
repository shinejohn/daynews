const fs = require('fs');

// Read the failed components
const failedComponents = ['SignupPage', 'DoerTimeline', 'UserInvoicesPage', 'VendorInvoicesPage', 'TaskReport'];

console.log('Manual Mock Data Extraction Helper');
console.log('==================================\n');

failedComponents.forEach(comp => {
    const paths = [
        `./src/components/${comp}.tsx`,
        `./src/components/Pages/${comp}.tsx`,
        `./src/components/Auth/${comp}.tsx`,
        `./src/components/Invoice/${comp}.tsx`
    ];
    
    for (const path of paths) {
        if (fs.existsSync(path)) {
            console.log(`\n📄 ${comp} - Check ${path}`);
            console.log('Look for:');
            console.log('- useState with arrays or objects');
            console.log('- const mockData = ...');
            console.log('- Hard-coded data in render');
            break;
        }
    }
});

console.log('\n\nCreate manual seed files in src/lib/supabase/seeds/manual/');
