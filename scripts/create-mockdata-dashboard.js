#!/usr/bin/env node

/**
 * Create Mock Data Dashboard
 * Generates an interactive HTML dashboard for mock data management
 */

const fs = require('fs');
const path = require('path');

// Load the registry
const registryPath = './mockdata-registry.json';
if (!fs.existsSync(registryPath)) {
  console.error('Registry not found. Run: node scripts/create-mockdata-registry.js');
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

// Generate HTML dashboard
function generateDashboard() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mock Data Registry Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
  <style>
    .status-active { background-color: #fef3c7; color: #92400e; }
    .status-converted { background-color: #d1fae5; color: #065f46; }
    .status-pending { background-color: #e0e7ff; color: #3730a3; }
  </style>
</head>
<body class="bg-gray-50">
  <div class="container mx-auto px-4 py-8" x-data="dashboard()">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Mock Data Registry Dashboard</h1>
      <p class="text-gray-600">Last updated: ${new Date(registry.lastUpdated).toLocaleString()}</p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-sm font-medium text-gray-500">Total Files</h3>
        <p class="text-2xl font-bold text-gray-900">${registry.summary.totalFiles}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-sm font-medium text-gray-500">Files with Mock Data</h3>
        <p class="text-2xl font-bold text-gray-900">${Object.keys(registry.files).length}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-sm font-medium text-gray-500">Mock Data Instances</h3>
        <p class="text-2xl font-bold text-gray-900">${registry.summary.totalMockDataInstances}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-sm font-medium text-gray-500">Conversion Progress</h3>
        <p class="text-2xl font-bold text-gray-900">
          ${Math.round((registry.summary.byStatus.converted / Object.keys(registry.files).length) * 100)}%
        </p>
      </div>
    </div>

    <!-- Status Overview -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Status Overview</h2>
      <div class="flex space-x-4">
        <div class="flex items-center">
          <span class="w-4 h-4 rounded status-active mr-2"></span>
          <span class="text-sm">Active: ${registry.summary.byStatus.active}</span>
        </div>
        <div class="flex items-center">
          <span class="w-4 h-4 rounded status-converted mr-2"></span>
          <span class="text-sm">Converted: ${registry.summary.byStatus.converted}</span>
        </div>
        <div class="flex items-center">
          <span class="w-4 h-4 rounded status-pending mr-2"></span>
          <span class="text-sm">Pending: ${registry.summary.byStatus.pending}</span>
        </div>
      </div>
    </div>

    <!-- Data Type Distribution -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Data Type Distribution</h2>
      <div class="space-y-2">
        ${Object.entries(registry.summary.byType)
          .sort((a, b) => b[1] - a[1])
          .map(([type, count]) => {
            const percentage = (count / registry.summary.totalMockDataInstances) * 100;
            return `
        <div class="flex items-center">
          <span class="w-24 text-sm font-medium">${type}</span>
          <div class="flex-1 mx-4">
            <div class="bg-gray-200 rounded-full h-4 relative">
              <div class="bg-blue-500 h-4 rounded-full" style="width: ${percentage}%"></div>
            </div>
          </div>
          <span class="text-sm text-gray-600">${count}</span>
        </div>`;
          }).join('')}
      </div>
    </div>

    <!-- Files Table -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-900">Files with Mock Data</h2>
        <div class="space-x-2">
          <button @click="filterStatus = 'all'" 
                  :class="filterStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
                  class="px-3 py-1 rounded text-sm">
            All
          </button>
          <button @click="filterStatus = 'active'"
                  :class="filterStatus === 'active' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'"
                  class="px-3 py-1 rounded text-sm">
            Active
          </button>
          <button @click="filterStatus = 'converted'"
                  :class="filterStatus === 'converted' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'"
                  class="px-3 py-1 rounded text-sm">
            Converted
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th class="pb-3">File</th>
              <th class="pb-3">Status</th>
              <th class="pb-3">Mock Data</th>
              <th class="pb-3">Data Types</th>
              <th class="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <template x-for="file in filteredFiles" :key="file.path">
              <tr>
                <td class="py-3">
                  <div>
                    <div class="text-sm font-medium text-gray-900" x-text="file.fileName"></div>
                    <div class="text-xs text-gray-500" x-text="file.path"></div>
                  </div>
                </td>
                <td class="py-3">
                  <span class="px-2 py-1 text-xs rounded-full"
                        :class="'status-' + file.status"
                        x-text="file.status"></span>
                </td>
                <td class="py-3 text-sm" x-text="file.mockData.length + ' instances'"></td>
                <td class="py-3">
                  <div class="text-xs space-x-1">
                    <template x-for="type in getDataTypes(file)" :key="type">
                      <span class="bg-gray-100 px-2 py-1 rounded" x-text="type"></span>
                    </template>
                  </div>
                </td>
                <td class="py-3 text-sm">
                  <button class="text-blue-600 hover:text-blue-800"
                          @click="showFileDetails(file)">
                    View Details
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- File Details Modal -->
    <div x-show="selectedFile" x-cloak
         class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
         @click.away="selectedFile = null">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
           @click.stop>
        <h3 class="text-lg font-bold mb-4" x-text="selectedFile?.fileName"></h3>
        <div class="space-y-4">
          <template x-for="mock in selectedFile?.mockData" :key="mock.line">
            <div class="border rounded p-3">
              <div class="flex justify-between items-start mb-2">
                <span class="text-sm font-medium" x-text="'Line ' + mock.line"></span>
                <span class="text-xs bg-gray-100 px-2 py-1 rounded" x-text="mock.type"></span>
              </div>
              <pre class="text-xs bg-gray-50 p-2 rounded overflow-x-auto" x-text="mock.preview"></pre>
              <div class="mt-2 text-xs text-gray-600">
                <span x-show="mock.variableName">Variable: <code x-text="mock.variableName"></code></span>
                <span x-show="mock.dataType" class="ml-3">Type: <code x-text="mock.dataType"></code></span>
              </div>
            </div>
          </template>
        </div>
        <button @click="selectedFile = null"
                class="mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
          Close
        </button>
      </div>
    </div>
  </div>

  <script>
    function dashboard() {
      return {
        filterStatus: 'all',
        selectedFile: null,
        files: ${JSON.stringify(Object.values(registry.files))},
        
        get filteredFiles() {
          if (this.filterStatus === 'all') return this.files;
          return this.files.filter(f => f.status === this.filterStatus);
        },
        
        getDataTypes(file) {
          const types = new Set();
          file.mockData.forEach(m => {
            if (m.dataType && m.dataType !== 'unknown') types.add(m.dataType);
          });
          return Array.from(types);
        },
        
        showFileDetails(file) {
          this.selectedFile = file;
        }
      }
    }
  </script>
</body>
</html>`;

  fs.writeFileSync('./mockdata-dashboard.html', html);
  console.log('✓ Created interactive dashboard: mockdata-dashboard.html');
}

// Generate VS Code workspace recommendations
function generateVSCodeConfig() {
  const tasks = {
    version: "2.0.0",
    tasks: [
      {
        label: "Update Mock Data Registry",
        type: "shell",
        command: "npm run mockdata:scan",
        group: "build",
        presentation: {
          reveal: "always",
          panel: "new"
        }
      },
      {
        label: "Convert Current File to Data Toggle",
        type: "shell",
        command: "node scripts/convert-component-to-toggle.js ${file}",
        group: "build",
        presentation: {
          reveal: "always",
          panel: "new"
        }
      }
    ]
  };

  const vscodePath = './.vscode';
  if (!fs.existsSync(vscodePath)) {
    fs.mkdirSync(vscodePath);
  }
  
  fs.writeFileSync(path.join(vscodePath, 'tasks.json'), JSON.stringify(tasks, null, 2));
  console.log('✓ Created VS Code tasks');
}

// Main execution
console.log('📊 Creating Mock Data Dashboard...\n');

generateDashboard();
generateVSCodeConfig();

console.log('\n✅ Dashboard created successfully!');
console.log('\nTo view the dashboard:');
console.log('1. Open mockdata-dashboard.html in your browser');
console.log('2. Or run: open mockdata-dashboard.html (macOS)');
console.log('\nVS Code users:');
console.log('- Use Cmd+Shift+P → "Tasks: Run Task" to access mock data tasks');