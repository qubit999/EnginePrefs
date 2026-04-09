//
//  ViewController.swift
//  EnginePrefs
//
//  Created by Alexander on 4/9/26.
//

import UIKit

class ViewController: UIViewController {

    private let urlKey = "searchEngineURL"

    private let urlField = UITextField()
    private let statusLabel = UILabel()

    private lazy var sharedDefaults: UserDefaults? = {
        guard let groupID = Bundle.main.object(forInfoDictionaryKey: "AppGroupIdentifier") as? String else {
            return nil
        }
        return UserDefaults(suiteName: groupID)
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        buildUI()
        loadSavedURL()

        let tap = UITapGestureRecognizer(target: self, action: #selector(dismissKeyboard))
        tap.cancelsTouchesInView = false
        view.addGestureRecognizer(tap)
    }

    @objc private func dismissKeyboard() {
        view.endEditing(true)
    }

    private func buildUI() {
        let icon = UIImageView(image: UIImage(named: "Icon"))
        icon.contentMode = .scaleAspectFit

        // Wrap the icon so it stays centered while the stack uses .fill
        let iconWrap = UIView()
        icon.translatesAutoresizingMaskIntoConstraints = false
        iconWrap.addSubview(icon)
        NSLayoutConstraint.activate([
            icon.centerXAnchor.constraint(equalTo: iconWrap.centerXAnchor),
            icon.topAnchor.constraint(equalTo: iconWrap.topAnchor),
            icon.bottomAnchor.constraint(equalTo: iconWrap.bottomAnchor),
            icon.widthAnchor.constraint(equalToConstant: 72),
            icon.heightAnchor.constraint(equalToConstant: 72)
        ])

        let title = UILabel()
        title.text = "EnginePrefs"
        title.font = .systemFont(ofSize: 24, weight: .bold)
        title.textAlignment = .center

        let fieldLabel = UILabel()
        fieldLabel.text = "Search Engine URL"
        fieldLabel.font = .systemFont(ofSize: 15, weight: .semibold)

        urlField.placeholder = "https://example.com/search?q=%s"
        urlField.borderStyle = .roundedRect
        urlField.autocapitalizationType = .none
        urlField.autocorrectionType = .no
        urlField.spellCheckingType = .no
        urlField.keyboardType = .URL
        urlField.clearButtonMode = .whileEditing
        urlField.font = .systemFont(ofSize: 15)

        let hint = UILabel()
        hint.text = "Use %s where the search query should go."
        hint.font = .systemFont(ofSize: 13)
        hint.textColor = .secondaryLabel

        let saveBtn = UIButton(type: .system)
        saveBtn.setTitle("Save", for: .normal)
        saveBtn.titleLabel?.font = .systemFont(ofSize: 17, weight: .semibold)
        saveBtn.backgroundColor = .systemBlue
        saveBtn.setTitleColor(.white, for: .normal)
        saveBtn.layer.cornerRadius = 10
        saveBtn.heightAnchor.constraint(equalToConstant: 48).isActive = true
        saveBtn.addTarget(self, action: #selector(saveTapped), for: .touchUpInside)

        let resetBtn = UIButton(type: .system)
        resetBtn.setTitle("Reset to Safari Default", for: .normal)
        resetBtn.titleLabel?.font = .systemFont(ofSize: 17, weight: .semibold)
        resetBtn.setTitleColor(.systemRed, for: .normal)
        resetBtn.layer.cornerRadius = 10
        resetBtn.layer.borderWidth = 1
        resetBtn.layer.borderColor = UIColor.systemRed.cgColor
        resetBtn.heightAnchor.constraint(equalToConstant: 48).isActive = true
        resetBtn.addTarget(self, action: #selector(resetTapped), for: .touchUpInside)

        statusLabel.font = .systemFont(ofSize: 15)
        statusLabel.textAlignment = .center
        statusLabel.numberOfLines = 0
        statusLabel.isHidden = true

        let enableTitle = UILabel()
        enableTitle.text = "How to enable in Safari"
        enableTitle.font = .systemFont(ofSize: 15, weight: .semibold)
        enableTitle.textColor = .label

        let enableSteps = UILabel()
        enableSteps.text = "1. Open Settings\n2. Scroll to Apps \u{2192} Safari\n3. Tap Extensions\n4. Turn on EnginePrefs\n5. Set permission to \"Allow\" for all websites"
        enableSteps.font = .systemFont(ofSize: 14)
        enableSteps.textColor = .secondaryLabel
        enableSteps.numberOfLines = 0

        let enableBox = UIStackView(arrangedSubviews: [enableTitle, enableSteps])
        enableBox.axis = .vertical
        enableBox.spacing = 6
        enableBox.layoutMargins = UIEdgeInsets(top: 12, left: 14, bottom: 12, right: 14)
        enableBox.isLayoutMarginsRelativeArrangement = true
        enableBox.backgroundColor = .secondarySystemBackground
        enableBox.layer.cornerRadius = 10
        enableBox.clipsToBounds = true

        let stack = UIStackView(arrangedSubviews: [
            iconWrap, title, fieldLabel, urlField, hint,
            saveBtn, resetBtn, statusLabel, enableBox
        ])
        stack.axis = .vertical
        stack.spacing = 12
        stack.alignment = .fill
        stack.setCustomSpacing(4, after: fieldLabel)
        stack.setCustomSpacing(4, after: urlField)
        stack.setCustomSpacing(20, after: title)
        stack.setCustomSpacing(24, after: hint)
        stack.setCustomSpacing(24, after: statusLabel)

        let scrollView = UIScrollView()
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scrollView)

        stack.translatesAutoresizingMaskIntoConstraints = false
        scrollView.addSubview(stack)

        let safe = view.safeAreaLayoutGuide
        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: safe.topAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            scrollView.leadingAnchor.constraint(equalTo: safe.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: safe.trailingAnchor),

            stack.topAnchor.constraint(equalTo: scrollView.topAnchor, constant: 32),
            stack.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor, constant: -32),
            stack.leadingAnchor.constraint(equalTo: scrollView.leadingAnchor, constant: 32),
            stack.trailingAnchor.constraint(equalTo: scrollView.trailingAnchor, constant: -32),
            stack.widthAnchor.constraint(equalTo: scrollView.widthAnchor, constant: -64)
        ])
    }

    private func loadSavedURL() {
        urlField.text = sharedDefaults?.string(forKey: urlKey)
    }

    private func saveURL(_ url: String) {
        sharedDefaults?.set(url, forKey: urlKey)
    }

    private func removeURL() {
        sharedDefaults?.removeObject(forKey: urlKey)
    }

    @objc private func saveTapped() {
        let url = urlField.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""

        guard !url.isEmpty else {
            showStatus("Please enter a URL.", isError: true)
            return
        }
        guard url.hasPrefix("http://") || url.hasPrefix("https://") else {
            showStatus("URL must start with http:// or https://", isError: true)
            return
        }
        guard url.contains("%s") else {
            showStatus("URL must contain %s as a query placeholder.", isError: true)
            return
        }

        saveURL(url)
        showStatus("Saved!", isError: false)
    }

    @objc private func resetTapped() {
        removeURL()
        urlField.text = ""
        showStatus("Reset! Safari will use its default search engine.", isError: false)
    }

    private func showStatus(_ message: String, isError: Bool) {
        statusLabel.text = message
        statusLabel.textColor = isError ? .systemRed : .systemGreen
        statusLabel.isHidden = false

        guard !isError else { return }
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) { [weak self] in
            self?.statusLabel.isHidden = true
        }
    }

}
