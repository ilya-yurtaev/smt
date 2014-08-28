import yaml


def yaml_loader(file_path):
    data = None
    with open(file_path, 'r') as f:
        data = yaml.load(f)

    return data
