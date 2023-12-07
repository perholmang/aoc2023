use {
    regex::Regex,
    std::fs,
    std::env,
};

fn to_number(spelled: &str) -> usize {
    match spelled {
        "zero" => return 0,
        "one" => return 1,
        "two" => return 2,
        "three" => return 3,
        "four" => return 4,
        "five" => return 5,
        "six" => return 6,
        "seven" => return 7,
        "eight" => return 8,
        "nine" => return 9,
        _ => panic!("wrong number!"),
    }
}

fn find_digit(str: &str, parse_words: bool, last: bool) -> usize {
    let re = Regex::new(format!(r#"{}(?<digit>[0-9]{})"#, if last {".*" } else {""}, if parse_words {"|zero|one|two|three|four|five|six|seven|eight|nine"} else {""}).as_str()).unwrap();

    let Some(m) = re.captures(str) else {
        panic!("{} {}", str, last);
    };

    if &m["digit"].len() == &1 {
        return m["digit"].parse::<usize>().unwrap();
    }
    
    return to_number(&m["digit"])
}



fn main() {
    let contents = fs::read_to_string("./input.txt")
        .expect("file read error");

    let parse_words = match env::var("part").as_ref().map(String::as_ref) {
        Ok("part1") => false,
        Ok("part2") => true,
        Ok(_) => panic!("invalid part"),
        Err(_) => panic!("part not set"),
    };

    let mut total = 0;
    for (_, line) in contents.lines().into_iter().enumerate() {
        let first_digit = find_digit(line, parse_words, false);
        let last_digit = find_digit(line, parse_words, true);
        let together = format!("{}{}", &first_digit, &last_digit).parse::<usize>().unwrap();
        total += together;
    }
    println!("{}", total);

}



