/** Convert the app's bounded SQLite-compatible statements to PostgreSQL. Values stay bound. */
export function postgresQuery(input:string,parameterCount:number){
 if(!/^\s*(SELECT|INSERT|UPDATE|DELETE)\b/i.test(input)||/;|--|\/\*/.test(input))throw Error('Unsupported statement.');
 let sql=input.replace(/json_extract\((\w+),\s*'\$\.([a-zA-Z_]\w*)'\)/g,"($1::jsonb ->> '$2')").replace('SET count=count+1','SET count=limits.count+1');
 const ignore=/^INSERT OR IGNORE /i.test(sql);sql=sql.replace(/^INSERT OR IGNORE /i,'INSERT ');
 if(ignore)sql+=' ON CONFLICT DO NOTHING';
 let output='',index=0,quote='';
 for(let i=0;i<sql.length;){
   const char=sql[i];
   if(quote){output+=char;if(char===quote){if(sql[i+1]===quote){output+=sql[++i];}else quote='';}i++;continue;}
   if(char==="'"||char==='"'){quote=char;output+=char;i++;continue;}
   if(char==='?'){output+='$'+(++index);i++;continue;}
   const word=sql.slice(i).match(/^[a-zA-Z_][a-zA-Z_0-9]*/)?.[0];
   if(word){output+=['end','user','key'].includes(word)?'"'+word+'"':word;i+=word.length;continue;}
   output+=char;i++;
 }
 if(quote||index!==parameterCount)throw Error('Invalid statement parameters.');
 return output;
}
