const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('c:/Users/810am/Documents/Projects/kantoprep/src/lib/resourceData.ts');
let content = fs.readFileSync(targetPath, 'utf-8');

const ACADEMIC_TOOLS = {
  'ib-math-aa': {
    hasCalculator: true,
    defaultCalculatorMode: 'graphing',
    formulaBooklet: {
      title: 'IB Math Analysis & Approaches Formula Booklet',
      url: 'https://ibresources.org/wp-content/uploads/2020/09/Maths-AA-Formula-Booklet.pdf',
      edition: 'First Assessment 2021',
      description: 'Official formula booklet containing prior learning, algebra, functions, geometry, trigonometry, statistics, and calculus formulas.'
    }
  },
  'ib-math-ai': {
    hasCalculator: true,
    defaultCalculatorMode: 'graphing',
    formulaBooklet: {
      title: 'IB Math Applications & Interpretation Formula Booklet',
      url: 'https://ibresources.org/wp-content/uploads/2020/09/Maths-AI-Formula-Booklet.pdf',
      edition: 'First Assessment 2021',
      description: 'Official formula booklet with statistical distributions, Voronoi diagrams, matrix operations, and regression formulas.'
    }
  },
  'ib-physics': {
    hasCalculator: true,
    defaultCalculatorMode: 'scientific',
    formulaBooklet: {
      title: 'IB Physics Data Booklet',
      url: 'https://ibresources.org/wp-content/uploads/2020/09/Physics-Data-Booklet.pdf',
      edition: 'Official Syllabus Edition',
      description: 'Physical constants, metric prefixes, unit conversions, and all Core and Additional Higher Level (AHL) equations.'
    }
  },
  'ib-chemistry': {
    hasCalculator: true,
    defaultCalculatorMode: 'scientific',
    formulaBooklet: {
      title: 'IB Chemistry Data Booklet',
      url: 'https://ibresources.org/wp-content/uploads/2020/09/Chemistry-Data-Booklet.pdf',
      edition: 'Official Syllabus Edition',
      description: 'The periodic table of elements, thermodynamic constants, bond enthalpies, infrared and NMR spectroscopic data tables.'
    }
  },
  'ib-biology': {
    hasCalculator: true,
    defaultCalculatorMode: 'scientific',
    formulaBooklet: {
      title: 'IB Biology Statistical Formula Sheet',
      url: 'https://ibresources.org/wp-content/uploads/2020/09/Biology-Formula-Sheet.pdf',
      edition: 'Official Reference',
      description: 'Chi-squared distribution table, t-test critical values, standard deviation, and Simpson diversity index.'
    }
  },
  'ap-calculus-bc': {
    hasCalculator: true,
    defaultCalculatorMode: 'graphing',
    formulaBooklet: {
      title: 'AP Calculus BC Equations & Formula Sheet',
      url: 'https://apcentral.collegeboard.org/media/pdf/ap-calculus-bc-course-and-exam-description.pdf',
      edition: 'College Board CED',
      description: 'Derivatives, indefinite integrals, Maclaurin series expansions, polar coordinates, and parametric calculus formulas.'
    }
  },
  'ap-calculus-ab': {
    hasCalculator: true,
    defaultCalculatorMode: 'graphing',
    formulaBooklet: {
      title: 'AP Calculus AB Equations & Formula Sheet',
      url: 'https://apcentral.collegeboard.org/media/pdf/ap-calculus-ab-course-and-exam-description.pdf',
      edition: 'College Board CED',
      description: 'Fundamental theorem of calculus, standard integration rules, and differential equation models.'
    }
  },
  'ap-physics-c-mechanics': {
    hasCalculator: true,
    defaultCalculatorMode: 'scientific',
    formulaBooklet: {
      title: 'AP Physics C Equations & Information Sheet',
      url: 'https://apcentral.collegeboard.org/media/pdf/ap-physics-c-tables-equations.pdf',
      edition: 'Official College Board',
      description: 'Physical constants, conversion factors, trigonometric functions, and calculus-based mechanics equations.'
    }
  },
  'ap-physics-1': {
    hasCalculator: true,
    defaultCalculatorMode: 'scientific',
    formulaBooklet: {
      title: 'AP Physics 1 Equation Sheet',
      url: 'https://apcentral.collegeboard.org/media/pdf/ap-physics-1-equations-table.pdf',
      edition: 'Official College Board',
      description: 'Kinematics, dynamics, circular motion, energy, momentum, and simple harmonic motion equations.'
    }
  },
  'ap-chemistry': {
    hasCalculator: true,
    defaultCalculatorMode: 'scientific',
    formulaBooklet: {
      title: 'AP Chemistry Equations and Constants Sheet',
      url: 'https://apcentral.collegeboard.org/media/pdf/ap-chemistry-equations-and-constants.pdf',
      edition: 'Official College Board',
      description: 'Periodic table of elements, gas laws, thermodynamics, equilibrium constants, and electrochemistry equations.'
    }
  },
  'ap-biology': {
    hasCalculator: true,
    defaultCalculatorMode: 'scientific',
    formulaBooklet: {
      title: 'AP Biology Equations & Formulas Sheet',
      url: 'https://apcentral.collegeboard.org/media/pdf/ap-biology-equations-formulas-sheet.pdf',
      edition: 'Official College Board',
      description: 'Statistical analysis, Chi-square table, Hardy-Weinberg equilibrium equations, and metric prefixes.'
    }
  },
  'igcse-extended-math': {
    hasCalculator: true,
    defaultCalculatorMode: 'scientific',
    formulaBooklet: {
      title: 'Cambridge IGCSE Mathematics (0580) Formulae',
      url: 'https://www.cambridgeinternational.org/Images/597380-2023-2024-syllabus.pdf',
      edition: 'Cambridge Assessment',
      description: 'Curved surface area, volume of cone/sphere/pyramid, quadratic formula, sine rule, and cosine rule.'
    }
  },
  'igcse-add-math': {
    hasCalculator: true,
    defaultCalculatorMode: 'scientific',
    formulaBooklet: {
      title: 'Cambridge IGCSE Additional Mathematics (0606) Formulae',
      url: 'https://www.cambridgeinternational.org/Images/597382-2023-2024-syllabus.pdf',
      edition: 'Cambridge Assessment',
      description: 'Binomial expansion, trigonometric identities, differentiation and integration rules.'
    }
  },
  'igcse-physics': {
    hasCalculator: true,
    defaultCalculatorMode: 'scientific'
  },
  'igcse-chemistry': {
    hasCalculator: true,
    defaultCalculatorMode: 'scientific',
    formulaBooklet: {
      title: 'Cambridge IGCSE Chemistry Periodic Table & Data',
      url: 'https://www.cambridgeinternational.org/Images/597384-2023-2024-syllabus.pdf',
      edition: 'Cambridge Assessment',
      description: 'The periodic table of elements, ion charges, and analytical test identification tables.'
    }
  },
  'igcse-biology': {
    hasCalculator: true,
    defaultCalculatorMode: 'scientific'
  },
  'digital-sat-math': {
    hasCalculator: true,
    defaultCalculatorMode: 'graphing',
    formulaBooklet: {
      title: 'Digital SAT Math Reference Information & Formulae',
      url: 'https://satsuite.collegeboard.org/media/pdf/sat-math-reference.pdf',
      edition: 'Official College Board Bluebook',
      description: 'Official reference sheet provided directly in the Bluebook testing app: circle formulas, Pythagorean theorem, special right triangles, and 3D volume formulas.'
    }
  }
};

for (const [id, tools] of Object.entries(ACADEMIC_TOOLS)) {
  // Find subject block starting with id: '${id}',
  const regex = new RegExp(`(\\s*id:\\s*'${id}',[\\s\\S]*?icon:\\s*'[^']+',)(\\s*topics:)`);
  if (!regex.test(content)) {
    console.warn(`Subject ${id} not matched`);
    continue;
  }

  let injection = '';
  if (tools.hasCalculator) {
    injection += `\n    hasCalculator: true,`;
  }
  if (tools.defaultCalculatorMode) {
    injection += `\n    defaultCalculatorMode: '${tools.defaultCalculatorMode}',`;
  }
  if (tools.formulaBooklet) {
    injection += `\n    formulaBooklet: {
      title: ${JSON.stringify(tools.formulaBooklet.title)},
      url: ${JSON.stringify(tools.formulaBooklet.url)},
      edition: ${JSON.stringify(tools.formulaBooklet.edition)},
      description: ${JSON.stringify(tools.formulaBooklet.description)},
    },`;
  }

  content = content.replace(regex, `$1${injection}$2`);
}

fs.writeFileSync(targetPath, content, 'utf-8');
console.log('Successfully injected academic tools into resourceData.ts');
