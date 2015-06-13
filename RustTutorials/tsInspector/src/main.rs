use std::io::{BufReader,BufRead};
  use std::fs::File;
  use std::path::Path;

  fn main() {
      let path = Path::new("Employee.ts");
      let file = BufReader::new(File::open(&path).unwrap());
      let ws : &[_] = &[' ', '\t'];
      for line in file.lines() {
          let unwrapped_line = line.unwrap();
          let trimmed_line = unwrapped_line.trim_matches(ws);
          if trimmed_line.starts_with("interface"){
            println!("{}", trimmed_line);
          }
          
      }
  }
