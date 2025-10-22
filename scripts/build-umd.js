const fs = require('fs');
const path = require('path');
const terser = require('terser');

const esmAccordionPath = path.resolve(__dirname, '..', 'esm', 'Accordion.js');
const distPath = path.resolve(__dirname, '..', 'dist', 'accordion.min.js');

const umdWrapper = (body) =>
  `(function(g,f){if(typeof define==='function'&&define.amd){define(f);}else if(typeof module==='object'&&module.exports){module.exports=f();}else{var e=f();g.Accordion=e;}}(typeof self!=='undefined'?self:this,function(){${body}}));`;

async function build() {
  let source = fs.readFileSync(esmAccordionPath, 'utf8');

  source = source
    .replace(/export\s+class\s+Accordion/, 'class Accordion')
    .replace(/export\s+default\s+function\s+createAccordion/, 'function createAccordion');

  const body = `${source}
createAccordion.Accordion=Accordion;
createAccordion.AccordionController=Accordion;
return createAccordion;`;

  const wrapped = umdWrapper(body);
  const minified = await terser.minify(wrapped, {
    compress: {
      passes: 2,
      pure_getters: true
    },
    mangle: {
      properties: false,
      toplevel: true
    },
    ecma: 2020
  });

  if (minified.code) {
    fs.writeFileSync(distPath, minified.code);
    process.stdout.write(`UMD bundle written to ${path.relative(process.cwd(), distPath)}\\n`);
  } else {
    throw new Error(minified.error?.message || 'Terser failed to produce output');
  }
}

build().catch((error) => {
  process.stderr.write(`${String(error.message || error)}\\n`);
  process.exitCode = 1;
});
