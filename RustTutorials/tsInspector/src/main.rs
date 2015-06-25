use std::io::{BufReader,BufRead};
  use std::fs::File;
  use std::path::Path;

  struct TSInterface{
    name: String,
    fields:  Vec<interfaceField>,
  }
  
  struct interfaceField{
     js_doc: String,
     active_line: String,
  }
  
  fn main() {
      let path = Path::new("Employee.ts");
      let file = BufReader::new(File::open(&path).unwrap());
      let ws : &[_] = &[' ', '\t'];
      let mut interfaces: Vec<TSInterface> = Vec::new();
      let mut inside_interface = false;
      let mut current_field : interfaceField;
      let mut interface : TSInterface;
      for line in file.lines() {
          let unwrapped_line = line.unwrap();
          let trimmed_line = unwrapped_line.trim_matches(ws);
          if trimmed_line.contains("interface") {
            interface = TSInterface{
              name: trimmed_line.to_string(),
              fields: Vec::new(),
            };
            interfaces.push(interface);
            inside_interface = true;
            current_field = interfaceField{
              js_doc: "".to_string(),
              active_line: "".to_string(),
            }; 
            //println!("{}", trimmed_line);
            //println!("{:?}", interface); 
          }else if inside_interface{
            if trimmed_line == "}"{
              inside_interface = false;
              interface.fields.push(current_field);
              
            }else if trimmed_line.starts_with("/"){
              current_field.js_doc.push_str(&unwrapped_line);
            }
          }
          
      }
      for inter in interfaces{
        println!("{}", inter.name);
      }
  }
