use std::fs;
use regex::Regex;
use num::integer::lcm;
use std::collections::HashMap;
use std::env;

fn steps_to_reach_end(path: &str, start_location: &str, map: &HashMap<String, (String, String)>) -> usize {
    let mut location = start_location;
    let mut steps = 0;

    loop {
        let direction = path.chars().nth(steps % path.len()).unwrap();
        let (next_lft, next_rgt) = map.get(location).unwrap();

        let next_location = match direction {
            'L' => next_lft,
            'R' => next_rgt,
            _ => panic!("!"),
        };

        if next_location.ends_with("Z") {
            return steps+1
        }

        location = next_location;
        steps += 1;
    }
}

fn main() {
    let starting_location_match = match env::var("part").as_ref().map(String::as_ref) {
        Ok("part1") => "AAA",
        Ok("part2") => "A",
        Ok(_) => panic!("invalid part"),
        Err(_) => panic!("part not set"),
    };

    let re = Regex::new(r"(?<from>[A-Z0-9]{3}) = \((?<lft>[A-Z0-9]{3}), (?<rgt>[A-Z0-9]{3})\)").unwrap();
    let contents = fs::read_to_string("./input.txt")
        .expect("file read error");

    let Some((path,mappings)) = contents.split_once("\n\n") else { panic!("!"); };
    let mut map:HashMap<String, (String, String)> = HashMap::new();

    for line in mappings.lines() {        
        let Some(m) = re.captures(line) else {
            panic!("no! {}", line);
        };

        map.insert(m["from"].to_string(), (m["lft"].to_string(), m["rgt"].to_string()));
    }


    let locations = map.clone().into_iter().filter(|(start, (_, _))| start.ends_with(starting_location_match)).map(|(k, _)| k).collect::<Vec<_>>();

    let mut steps: Vec<usize> = Vec::new();
    for starting_location in locations.iter() {
        let n_steps = steps_to_reach_end(path, starting_location, &map);
        steps.push(n_steps)
    }

    let mut lcm_n:u64 = steps[0].try_into().unwrap();
    
    for no in &steps[1..] {
        lcm_n = lcm(lcm_n, (*no).try_into().unwrap());
    }

    println!("{}", lcm_n);

}


